import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { listMenu, placeOrder } from "@/lib/ordering.functions";
import { money, type MenuItem } from "@/lib/order-model";
import { rememberCode } from "@/lib/ticket-book";

export const Route = createFileRoute("/")({ component: MenuPage });

type CartLine = { item: MenuItem; qty: number };

function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState<{ code: string; totalCents: number } | null>(null);

  useEffect(() => {
    listMenu()
      .then(setMenu)
      .catch(() => setError("The menu did not load. Try again in a moment."));
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((item) => item.category)))],
    [menu],
  );
  const visible = menu.filter(
    (item) => item.available && (category === "All" || item.category === category),
  );
  const count = cart.reduce((sum, line) => sum + line.qty, 0);
  const total = cart.reduce((sum, line) => sum + line.item.priceCents * line.qty, 0);

  function add(item: MenuItem) {
    setCart((current) => {
      const found = current.find((line) => line.item.id === item.id);
      if (found) {
        return current.map((line) =>
          line.item.id === item.id ? { ...line, qty: Math.min(12, line.qty + 1) } : line,
        );
      }
      return [...current, { item, qty: 1 }];
    });
  }

  function setQty(id: string, qty: number) {
    setCart((current) =>
      qty <= 0 ? current.filter((line) => line.item.id !== id) : current.map((line) => (line.item.id === id ? { ...line, qty } : line)),
    );
  }

  async function submit() {
    if (cart.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const result = await placeOrder({
        data: {
          items: cart.map((line) => ({ id: line.item.id, qty: line.qty })),
          note,
        },
      });
      rememberCode(result.code);
      setPlaced(result);
      setCart([]);
      setNote("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place the order.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader cartCount={count} onCart={() => setOpen(true)} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm font-medium uppercase tracking-widest text-copper">Tonight</p>
        <h1 className="mt-2 max-w-xl text-4xl text-ink sm:text-5xl">A short menu, cooked to order.</h1>
        <p className="mt-3 max-w-lg text-muted">
          Add what you want. You get a ticket code — keep it on this phone under Orders to watch it move.
        </p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-medium ${
                category === name ? "bg-ink text-surface" : "border border-line bg-surface text-ink"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-copper-deep">{error}</p> : null}

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {visible.map((item) => (
            <li key={item.id} className="flex flex-col rounded-card border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted">{item.category}</p>
                  <h2 className="mt-1 text-2xl">{item.name}</h2>
                </div>
                <p className="font-medium text-copper-deep">{money(item.priceCents)}</p>
              </div>
              <p className="mt-2 flex-1 text-sm text-muted">{item.blurb}</p>
              <button
                type="button"
                onClick={() => add(item)}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-olive px-4 text-sm font-medium text-surface"
              >
                <Plus className="size-4" aria-hidden />
                Add
              </button>
            </li>
          ))}
        </ul>
        {menu.length > 0 && visible.length === 0 ? (
          <p className="mt-8 text-muted">Nothing in this section right now.</p>
        ) : null}
      </main>

      {open ? (
        <div className="fixed inset-0 z-30 flex justify-end bg-ink/40">
          <button type="button" className="hidden flex-1 sm:block" aria-label="Close bag" onClick={() => setOpen(false)} />
          <aside className="flex h-full w-full max-w-md flex-col bg-surface text-ink shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-2xl">Your bag</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-full border border-line" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? (
                <p className="text-muted">Nothing yet. The menu is short on purpose.</p>
              ) : (
                <ul className="space-y-4">
                  {cart.map((line) => (
                    <li key={line.item.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{line.item.name}</p>
                        <p className="text-sm text-muted">{money(line.item.priceCents)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => setQty(line.item.id, line.qty - 1)} aria-label="Decrease">
                          <Minus className="size-4" />
                        </button>
                        <span className="w-6 text-center font-medium">{line.qty}</span>
                        <button type="button" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => setQty(line.item.id, line.qty + 1)} aria-label="Increase">
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <label className="mt-6 block text-sm font-medium" htmlFor="note">
                Kitchen note
              </label>
              <textarea
                id="note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={140}
                rows={3}
                placeholder="No onion, sauce on the side"
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-3 py-3 text-sm outline-none"
              />
            </div>
            <div className="border-t border-line px-5 py-4">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-muted">Total</span>
                <span className="font-display text-2xl">{money(total)}</span>
              </div>
              <button
                type="button"
                disabled={busy || cart.length === 0}
                onClick={submit}
                className="min-h-12 w-full rounded-full bg-copper text-sm font-medium text-surface disabled:opacity-50"
              >
                {busy ? "Sending…" : "Place order"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {placed ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/50 px-4">
          <div className="w-full max-w-sm rounded-card bg-surface p-6 text-center text-ink">
            <p className="text-sm uppercase tracking-widest text-copper">Ticket</p>
            <p className="mt-2 font-display text-5xl tracking-widest">{placed.code}</p>
            <p className="mt-3 text-sm text-muted">
              {money(placed.totalCents)} · saved to Orders on this device. Show the code at the pass.
            </p>
            <a
              href="/orders"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-ink text-sm font-medium text-surface"
            >
              Watch this order
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
