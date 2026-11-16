import { o as __toESM } from "../_runtime.mjs";
import { n as money, r as statusLabel } from "./order-model-Dciu5wMp.mjs";
import { J as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as getTickets } from "./ordering.functions-DumYUAf3.mjs";
import { i as rememberCode, n as forgetCode, r as readCodes, t as SiteHeader } from "./ticket-book-D1msjIEq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-CZfk6yH6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"pending",
	"preparing",
	"ready",
	"collected"
];
function OrdersPage() {
	const [codes, setCodes] = (0, import_react.useState)([]);
	const [tickets, setTickets] = (0, import_react.useState)([]);
	const [missing, setMissing] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const refresh = (0, import_react.useCallback)(async (list) => {
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
	(0, import_react.useEffect)(() => {
		const stored = readCodes();
		setCodes(stored);
		refresh(stored);
	}, [refresh]);
	(0, import_react.useEffect)(() => {
		if (codes.length === 0) return;
		const timer = window.setInterval(() => void refresh(codes), 8e3);
		return () => window.clearInterval(timer);
	}, [codes, refresh]);
	function attach(event) {
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
		refresh(next);
	}
	function drop(code) {
		forgetCode(code);
		const next = readCodes();
		setCodes(next);
		refresh(next);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-3xl px-4 py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium uppercase tracking-widest text-copper",
					children: "Your history"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-4xl",
					children: "Tickets on this device"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-lg text-muted",
					children: "Orders you place here stay in this browser. Add a code from another phone if someone sent you one. Status refreshes on its own."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: attach,
					className: "mt-6 flex flex-col gap-2 sm:flex-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "sr-only",
							htmlFor: "code",
							children: "Ticket code"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "code",
							value: draft,
							onChange: (event) => setDraft(event.target.value.toUpperCase()),
							placeholder: "Ticket code",
							maxLength: 8,
							className: "min-h-12 flex-1 rounded-full border border-line bg-surface px-4 tracking-widest outline-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "min-h-12 rounded-full bg-ink px-5 text-sm font-medium text-surface",
							children: "Add to history"
						})
					]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-copper-deep",
					children: error
				}) : null,
				codes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-10 rounded-card border border-dashed border-line bg-surface p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl",
							children: "No tickets yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: "Place an order and it will land here with a live status."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "mt-5 inline-flex min-h-11 items-center rounded-full bg-copper px-5 text-sm font-medium text-surface",
							children: "See the menu"
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-8 space-y-4",
					children: [tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-card border border-line bg-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-3xl tracking-widest",
									children: ticket.code
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted",
									children: [
										new Date(ticket.createdAt).toLocaleString(),
										" · ",
										money(ticket.totalCents)
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-bg px-3 py-1 text-sm font-medium text-olive",
									children: statusLabel(ticket.status)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-4 grid grid-cols-4 gap-2",
								children: STEPS.map((step, index) => {
									const reached = STEPS.indexOf(ticket.status) >= index;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-1.5 rounded-full ${reached ? "bg-copper" : "bg-line"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `mt-2 text-xs ${reached ? "text-ink" : "text-muted"}`,
											children: statusLabel(step)
										})]
									}, step);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 space-y-1 text-sm",
								children: ticket.items.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										line.qty,
										" × ",
										line.name
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: money(line.priceCents * line.qty)
									})]
								}, line.id))
							}),
							ticket.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm text-muted",
								children: ["Note: ", ticket.note]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => drop(ticket.code),
								className: "mt-4 text-sm text-muted underline",
								children: "Remove from this device"
							})
						]
					}, ticket.code)), missing.map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-card border border-line bg-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl tracking-widest",
								children: code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "No ticket with that code."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => drop(code),
								className: "mt-3 text-sm text-muted underline",
								children: "Remove"
							})
						]
					}, code))]
				})
			]
		})]
	});
}
//#endregion
export { OrdersPage as component };
