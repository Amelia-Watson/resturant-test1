import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { STATUSES, type MenuItem, type OrderLine, type OrderStatus, type Ticket } from "@/lib/order-model";

const PIN = "1847";

type MenuRow = {
  id: string;
  name: string;
  blurb: string;
  price_cents: number;
  category: string;
  available: boolean;
};

type OrderRow = {
  code: string;
  items: string;
  total_cents: number;
  note: string;
  status: string;
  created_at: string;
};

function mapMenu(row: MenuRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    blurb: row.blurb,
    priceCents: Number(row.price_cents),
    category: row.category,
    available: Boolean(row.available),
  };
}

function mapTicket(row: OrderRow): Ticket {
  const items = JSON.parse(row.items) as OrderLine[];
  const status = (STATUSES as readonly string[]).includes(row.status)
    ? (row.status as OrderStatus)
    : "pending";
  return {
    code: row.code,
    items,
    totalCents: Number(row.total_cents),
    note: row.note,
    status,
    createdAt: row.created_at,
  };
}

function ticketCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const lineInput = z.object({
  id: z.string().min(1).max(40),
  qty: z.number().int().min(1).max(12),
});

export const listMenu = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<MenuRow>`
    select id, name, blurb, price_cents, category, available
    from menu_items
    order by sort, name
  `;
  return rows.map(mapMenu);
});

export const placeOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      items: z.array(lineInput).min(1).max(20),
      note: z.string().max(140).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const menu = await sql<MenuRow>`
      select id, name, blurb, price_cents, category, available from menu_items
    `;
    const byId = new Map(menu.map((row) => [row.id, row]));
    const lines: OrderLine[] = [];
    for (const item of data.items) {
      const dish = byId.get(item.id);
      if (!dish || !dish.available) {
        throw new Error("Something on the ticket is no longer available.");
      }
      lines.push({
        id: dish.id,
        name: dish.name,
        priceCents: Number(dish.price_cents),
        qty: item.qty,
      });
    }
    const totalCents = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
    const note = (data.note ?? "").trim();
    let code = ticketCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await sql<{ code: string }>`select code from orders where code = ${code}`;
      if (existing.length === 0) break;
      code = ticketCode();
    }
    await sql`
      insert into orders (code, items, total_cents, note, status)
      values (${code}, ${JSON.stringify(lines)}, ${totalCents}, ${note}, 'pending')
    `;
    return { code, totalCents };
  });

export const getTickets = createServerFn({ method: "POST" })
  .validator(z.object({ codes: z.array(z.string().min(4).max(8)).max(40) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const tickets: Ticket[] = [];
    const seen = new Set<string>();
    for (const raw of data.codes) {
      const code = raw.trim().toUpperCase();
      if (seen.has(code)) continue;
      seen.add(code);
      const rows = await sql<OrderRow>`
        select code, items, total_cents, note, status, created_at::text as created_at
        from orders where code = ${code}
      `;
      if (rows[0]) tickets.push(mapTicket(rows[0]));
    }
    return tickets;
  });

function assertPin(pin: string) {
  if (pin !== PIN) throw new Error("That pin does not open the kitchen.");
}

export const kitchenOrders = createServerFn({ method: "POST" })
  .validator(z.object({ pin: z.string() }))
  .handler(async ({ data }) => {
    assertPin(data.pin);
    const sql = await getSql();
    const rows = await sql<OrderRow>`
      select code, items, total_cents, note, status, created_at::text as created_at
      from orders
      order by created_at desc
      limit 80
    `;
    return rows.map(mapTicket);
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      pin: z.string(),
      code: z.string().min(4).max(8),
      status: z.enum(STATUSES),
    }),
  )
  .handler(async ({ data }) => {
    assertPin(data.pin);
    const sql = await getSql();
    const code = data.code.toUpperCase();
    const updated = await sql<{ code: string }>`
      update orders set status = ${data.status} where code = ${code} returning code
    `;
    if (!updated[0]) throw new Error("Ticket not found.");
    return { ok: true as const };
  });

export const saveDish = createServerFn({ method: "POST" })
  .validator(
    z.object({
      pin: z.string(),
      id: z.string().min(1).max(40).optional(),
      name: z.string().min(1).max(60),
      blurb: z.string().max(140),
      priceCents: z.number().int().min(0).max(50000),
      category: z.string().min(1).max(24),
      available: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    assertPin(data.pin);
    const sql = await getSql();
    const id =
      data.id ??
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40);
    await sql`
      insert into menu_items (id, name, blurb, price_cents, category, available, sort)
      values (${id}, ${data.name.trim()}, ${data.blurb.trim()}, ${data.priceCents}, ${data.category.trim()}, ${data.available}, 50)
      on conflict (id) do update set
        name = excluded.name,
        blurb = excluded.blurb,
        price_cents = excluded.price_cents,
        category = excluded.category,
        available = excluded.available
    `;
    return { id };
  });

export const setDishAvailable = createServerFn({ method: "POST" })
  .validator(z.object({ pin: z.string(), id: z.string(), available: z.boolean() }))
  .handler(async ({ data }) => {
    assertPin(data.pin);
    const sql = await getSql();
    await sql`update menu_items set available = ${data.available} where id = ${data.id}`;
    return { ok: true as const };
  });
