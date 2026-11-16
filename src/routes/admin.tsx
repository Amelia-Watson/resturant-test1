import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { kitchenOrders, listMenu, saveDish, setDishAvailable, setOrderStatus } from "@/lib/ordering.functions";
import { money, STATUSES, statusLabel, type MenuItem, type OrderStatus, type Ticket } from "@/lib/order-model";

export const Route = createFileRoute("/admin")({ component: AdminPage });

const PIN_KEY = "sable-kitchen-pin";

function AdminPage() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"orders" | "menu">("orders");
  const [orders, setOrders] = useState<Ticket[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [draft, setDraft] = useState({
    id: "",
    name: "",
    blurb: "",
    price: "",
    category: "Plates",
    available: true,
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(PIN_KEY);
    if (saved) {
      setPin(saved);
      void unlock(saved);
    }
  }, []);

  async function unlock(nextPin: string) {
    setError("");
    try {
      const rows = await kitchenOrders({ data: { pin: nextPin } });
      setOrders(rows);
      setAuthed(true);
      sessionStorage.setItem(PIN_KEY, nextPin);
      const dishes = await listMenu();
      setMenu(dishes);
    } catch (err) {
      setAuthed(false);
      sessionStorage.removeItem(PIN_KEY);
      setError(err instanceof Error ? err.message : "Could not open the kitchen.");
    }
  }

  async function reload(current = pin) {
    const rows = await kitchenOrders({ data: { pin: current } });
    setOrders(rows);
    setMenu(await listMenu());
  }

  useEffect(() => {
    if (!authed) return;
    const timer = window.setInterval(() => {
      void reload().catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [authed, pin]);

  async function advance(code: string, status: OrderStatus) {
    await setOrderStatus({ data: { pin, code, status } });
    await reload();
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const priceCents = Math.round(Number(draft.price) * 100);
    if (!draft.name.trim() || Number.isNaN(priceCents)) return;
    await saveDish({
      data: {
        pin,
        id: draft.id || undefined,
        name: draft.name,
        blurb: draft.blurb,
        priceCents,
        category: draft.category,
        available: draft.available,
      },
    });
    setDraft({ id: "", name: "", blurb: "", price: "", category: "Plates", available: true });
    await reload();
  }

  if (!authed) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-4 text-surface">
        <form
          className="w-full max-w-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void unlock(pin);
          }}
        >
          <p className="text-sm uppercase tracking-widest text-copper">Kitchen</p>
          <h1 className="mt-2 font-display text-4xl">Sable Table</h1>
          <p className="mt-2 text-sm text-line">Staff pin for this demo is 1847.</p>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            inputMode="numeric"
            className="mt-6 min-h-12 w-full rounded-full bg-surface px-4 text-ink outline-none"
            placeholder="Pin"
            aria-label="Kitchen pin"
          />
          {error ? <p className="mt-3 text-sm text-copper">{error}</p> : null}
          <button type="submit" className="mt-4 min-h-12 w-full rounded-full bg-copper text-sm font-medium text-surface">
            Open the pass
          </button>
          <Link to="/" className="mt-4 block text-center text-sm text-line">
            Back to the menu
          </Link>
        </form>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-copper">Kitchen</p>
            <h1 className="text-2xl">Sable Table</h1>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setView("orders")} className={`min-h-11 rounded-full px-4 text-sm ${view === "orders" ? "bg-ink text-surface" : "border border-line"}`}>
              Tickets
            </button>
            <button type="button" onClick={() => setView("menu")} className={`min-h-11 rounded-full px-4 text-sm ${view === "menu" ? "bg-ink text-surface" : "border border-line"}`}>
              Menu
            </button>
            <Link to="/" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm">
              Guest view
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        {view === "orders" ? (
          <ul className="space-y-3">
            {orders.length === 0 ? <li className="text-muted">No tickets yet.</li> : null}
            {orders.map((ticket) => (
              <li key={ticket.code} className="rounded-card border border-line bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl tracking-widest">{ticket.code}</p>
                    <p className="text-sm text-muted">
                      {statusLabel(ticket.status)} · {money(ticket.totalCents)}
                    </p>
                    <p className="mt-2 text-sm">
                      {ticket.items.map((line) => `${line.qty}× ${line.name}`).join(", ")}
                    </p>
                    {ticket.note ? <p className="mt-1 text-sm text-muted">{ticket.note}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={ticket.status === status}
                        onClick={() => void advance(ticket.code, status)}
                        className={`min-h-11 rounded-full px-3 text-sm ${
                          ticket.status === status ? "bg-olive text-surface" : "border border-line"
                        }`}
                      >
                        {statusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <form onSubmit={(event) => void save(event)} className="rounded-card border border-line bg-surface p-5">
              <h2 className="text-2xl">{draft.id ? "Edit dish" : "New dish"}</h2>
              <label className="mt-4 block text-sm">Name</label>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="mt-1 min-h-11 w-full rounded-xl border border-line px-3" />
              <label className="mt-3 block text-sm">Description</label>
              <input value={draft.blurb} onChange={(e) => setDraft({ ...draft, blurb: e.target.value })} className="mt-1 min-h-11 w-full rounded-xl border border-line px-3" />
              <label className="mt-3 block text-sm">Price (dollars)</label>
              <input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} inputMode="decimal" className="mt-1 min-h-11 w-full rounded-xl border border-line px-3" />
              <label className="mt-3 block text-sm">Section</label>
              <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="mt-1 min-h-11 w-full rounded-xl border border-line px-3" />
              <button type="submit" className="mt-4 min-h-11 rounded-full bg-copper px-5 text-sm font-medium text-surface">
                Save dish
              </button>
            </form>
            <ul className="space-y-3">
              {menu.map((item) => (
                <li key={item.id} className="rounded-card border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted">
                        {item.category} · {money(item.priceCents)} · {item.available ? "On" : "Off"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="min-h-11 rounded-full border border-line px-3 text-sm"
                        onClick={() =>
                          setDraft({
                            id: item.id,
                            name: item.name,
                            blurb: item.blurb,
                            price: (item.priceCents / 100).toFixed(2),
                            category: item.category,
                            available: item.available,
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="min-h-11 rounded-full border border-line px-3 text-sm"
                        onClick={() =>
                          void setDishAvailable({ data: { pin, id: item.id, available: !item.available } }).then(() => reload())
                        }
                      >
                        {item.available ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
