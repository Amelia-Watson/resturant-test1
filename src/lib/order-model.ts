export const STATUSES = ["pending", "preparing", "ready", "collected"] as const;
export type OrderStatus = (typeof STATUSES)[number];

export type MenuItem = {
  id: string;
  name: string;
  blurb: string;
  priceCents: number;
  category: string;
  available: boolean;
};

export type OrderLine = {
  id: string;
  name: string;
  priceCents: number;
  qty: number;
};

export type Ticket = {
  code: string;
  items: OrderLine[];
  totalCents: number;
  note: string;
  status: OrderStatus;
  createdAt: string;
};

export function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function statusLabel(status: OrderStatus) {
  if (status === "pending") return "Received";
  if (status === "preparing") return "On the fire";
  if (status === "ready") return "Ready";
  return "Collected";
}
