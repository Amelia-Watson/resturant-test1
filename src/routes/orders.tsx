import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { getTableOrders } from "@/lib/ordering.functions";
import { money, statusLabel, type OrderLine, type OrderStatus, type Ticket } from "@/lib/order-model";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

const TABLE_KEY = "sable-table-no";
const STEPS: OrderStatus[] = ["pending", "preparing", "ready", "collected"];

function mergeLines(tickets: Ticket[]): OrderLine[] {
  const map = new Map<string, OrderLine>();
  for (const ticket of tickets) {
    for (const line of ticket.items) {
      const prev = map.get(line.id);
      if (prev) prev.qty += line.qty;
      else map.set(line.id, { ...line });
    }
  }
  return [...map.values()];
}

function OrdersPage() {
  const [tableNo, setTableNo] = useState(1);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async (n: number) => {
    try {
      setTickets(await getTableOrders({ data: { tableNo: n } }));
      setError("");
    } catch {
      setError("Could not load this table.");
    }
  }, []);

  useEffect(() => {
    const saved = Number(localStorage.getItem(TABLE_KEY));
    const n = saved >= 1 && saved <= 999 ? saved : 1;
    setTableNo(n);
    void refresh(n);
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(() => void refresh(tableNo), 8000);
    return () => window.clearInterval(timer);
  }, [tableNo, refresh]);

  function choose(n: number) {
    setTableNo(n);
    localStorage.setItem(TABLE_KEY, String(n));
    void refresh(n);
  }

  const open = tickets.filter((t) => t.status !== "collected");
  const lines = mergeLines(open.length ? open : tickets);
  const total = (open.length ? open : tickets).reduce((s, t) => s + t.totalCents, 0);
  const status: OrderStatus = open.length
    ? STEPS.find((step) => open.some((t) => t.status === step)) ?? "pending"
    : tickets.length
      ? "collected"
      : "pending";

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm font-medium uppercase tracking-widest text-copper">Table</p>
        <h1 className="mt-2 text-4xl">Everything on table {tableNo}</h1>
        <p className="mt-3 text-muted">Rounds sent from any phone for this table are combined here.</p>
        <label className="mt-5 block text-sm font-medium" htmlFor="table-lookup">
          Table number
        </label>
        <input
          id="table-lookup"
          inputMode="numeric"
          value={String(tableNo || "")}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
            const n = Number(digits);
            if (n >= 1 && n <= 999) choose(n);
            else setTableNo(0);
          }}
          className="mt-2 min-h-12 w-28 rounded-full border border-line bg-surface px-4 text-lg outline-none"
        />
        {error ? <p className="mt-3 text-sm text-copper-deep">{error}</p> : null}
        {tickets.length === 0 ? (
          <div className="mt-10 rounded-card border border-dashed border-line bg-surface p-8 text-center">
            <p className="font-display text-2xl">Nothing on this table</p>
            <Link to="/" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-copper px-5 text-sm font-medium text-surface">
              See the menu
            </Link>
          </div>
        ) : (
          <section className="mt-8 rounded-card border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-3xl">Table {tableNo}</p>
              <span className="rounded-full bg-bg px-3 py-1 text-sm font-medium text-olive">{statusLabel(status)}</span>
            </div>
            <ol className="mt-4 grid grid-cols-4 gap-2">
              {STEPS.map((step, index) => {
                const reached = STEPS.indexOf(status) >= index;
                return (
                  <li key={step} className="text-center">
                    <div className={`h-1.5 rounded-full ${reached ? "bg-copper" : "bg-line"}`} />
                    <p className={`mt-2 text-xs ${reached ? "text-ink" : "text-muted"}`}>{statusLabel(step)}</p>
                  </li>
                );
              })}
            </ol>
            <ul className="mt-4 space-y-1 text-sm">
              {lines.map((line) => (
                <li key={line.id} className="flex justify-between gap-3">
                  <span>
                    {line.qty} × {line.name}
                  </span>
                  <span className="text-muted">{money(line.priceCents * line.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-medium">Total {money(total)}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {tickets.map((ticket) => (
                <li key={ticket.code}>
                  {new Date(ticket.createdAt).toLocaleTimeString()} · {statusLabel(ticket.status)}
                  {ticket.note ? ` · ${ticket.note}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
