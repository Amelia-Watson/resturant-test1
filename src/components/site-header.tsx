import { Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";

export function SiteHeader({
  cartCount,
  onCart,
}: {
  cartCount?: number;
  onCart?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="min-w-0">
          <p className="font-display text-xl text-ink">Sable Table</p>
          <p className="text-sm text-muted">Pickup from the pass</p>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/orders"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink"
          >
            <ClipboardList className="size-4" aria-hidden />
            Orders
          </Link>
          {onCart ? (
            <button
              type="button"
              onClick={onCart}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-copper px-4 text-sm font-medium text-surface"
            >
              Bag
              <span className="grid size-6 place-items-center rounded-full bg-surface text-xs font-semibold text-copper-deep">
                {cartCount ?? 0}
              </span>
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
