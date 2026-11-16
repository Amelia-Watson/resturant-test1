import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { getTickets } from "@/lib/ordering.functions";
import { money, statusLabel, type OrderStatus, type Ticket } from "@/lib/order-model";
import { forgetCode, readCodes, rememberCode } from "@/lib/ticket-book";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

const STEPS: OrderStatus[] = ["pending", "preparing", "ready", "collected"];

function OrdersPage() {
  const [codes, setCodes] = useState<string[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async (list: string[]) => {
    if (list.length === 0) {
      setTickets([]);
      setMissing([]);
      return;
    }
    try {
      const found = await getTickets({ data: { codes: list } });
      const known = new Set(found.map((ticket) => ticket.code));
      setTickets(found);
      setMissing(list.filter((code) => !known.has(code)));
      setError("");
    } catch {
      setError("Could not refresh tickets.");
    }
  }, []);

  useEffect(() => {
    const stored = readCodes();
    setCodes(stored);
    void refresh(stored);
  }, [refresh]);

  useEffect(() => {
    if (codes.length === 0) return;
    const timer = window.setInterval(() => void refresh(codes), 8000);
    return () => window.clearInterval(timer);
  }, [codes, refresh]);

  function attach(event: React.FormEvent) {
    event.preventDefault();
    const code = draft.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,8}$/.test(code)) {
      setError("Ticket codes are 5 letters and numbers.");
      return;
    }
    rememberCode(code);
    const next = readCodes();
    setCodes(next);
    setDraft("");
    void refresh(next);
  }

  function drop(code: string) {
    forgetCode(code);
    const next = readCodes();
    setCodes(next);
    void refresh(next);
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm font-medium uppercase tracking-widest text-copper">Your history</p>
        <h1 className="mt-2 text-4xl">Tickets on this device</h1>
        <p className="mt-3 max-w-lg text-muted">
          Orders you place here stay in this browser. Add a code from another phone if someone sent you one.
          Status refreshes on its own.
        </p>

        <form onSubmit={attach} className="mt-6 flex flex-col gap-2 sm:flex-row">
          <label className="sr-only" htmlFor="code">
            Ticket code
          </label>
          <input
            id="code"
            value={draft}
            onChange={(event) => setDraft(event.target.value.toUpperCase())}
            placeholder="Ticket code"
            maxLength={8}
            className="min-h-12 flex-1 rounded-full border border-line bg-surface px-4 tracking-widest outline-none"
          />
          <button type="submit" className="min-h-12 rounded-full bg-ink px-5 text-sm font-medium text-surface">
            Add to history
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-copper-deep">{error}</p> : null}

        {codes.length === 0 ? (
          <div className="mt-10 rounded-card border border-dashed border-line bg-surface p-8 text-center">
            <p className="font-display text-2xl">No tickets yet</p>
            <p className="mt-2 text-sm text-muted">Place an order and it will land here with a live status.</p>
            <Link to="/" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-copper px-5 text-sm font-medium text-surface">
              See the menu
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {tickets.map((ticket) => (
              <li key={ticket.code} className="rounded-card border border-line bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-3xl tracking-widest">{ticket.code}</p>
                    <p className="mt-1 text-sm text-muted">
                      {new Date(ticket.createdAt).toLocaleString()} · {money(ticket.totalCents)}
                    </p>
                  </div>
                  <span className="rounded-full bg-bg px-3 py-1 text-sm font-medium text-olive">
                    {statusLabel(ticket.status)}
                  </span>
                </div>
                <ol className="mt-4 grid grid-cols-4 gap-2">
                  {STEPS.map((step, index) => {
                    const reached = STEPS.indexOf(ticket.status) >= index;
                    return (
                      <li key={step} className="text-center">
                        <div className={`h-1.5 rounded-full ${reached ? "bg-copper" : "bg-line"}`} />
                        <p className={`mt-2 text-xs ${reached ? "text-ink" : "text-muted"}`}>{statusLabel(step)}</p>
                      </li>
                    );
                  })}
                </ol>
                <ul className="mt-4 space-y-1 text-sm">
                  {ticket.items.map((line) => (
                    <li key={line.id} className="flex justify-between gap-3">
                      <span>
                        {line.qty} × {line.name}
                      </span>
                      <span className="text-muted">{money(line.priceCents * line.qty)}</span>
                    </li>
                  ))}
                </ul>
                {ticket.note ? <p className="mt-3 text-sm text-muted">Note: {ticket.note}</p> : null}
                <button type="button" onClick={() => drop(ticket.code)} className="mt-4 text-sm text-muted underline">
                  Remove from this device
                </button>
              </li>
            ))}
            {missing.map((code) => (
              <li key={code} className="rounded-card border border-line bg-surface p-5">
                <p className="font-display text-2xl tracking-widest">{code}</p>
                <p className="mt-2 text-sm text-muted">No ticket with that code.</p>
                <button type="button" onClick={() => drop(code)} className="mt-3 text-sm text-muted underline">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
