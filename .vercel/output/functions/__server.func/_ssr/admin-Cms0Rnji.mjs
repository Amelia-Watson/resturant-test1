import { o as __toESM } from "../_runtime.mjs";
import { n as money, r as statusLabel, t as STATUSES } from "./order-model-Dciu5wMp.mjs";
import { J as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as saveDish, n as kitchenOrders, o as setDishAvailable, r as listMenu, s as setOrderStatus } from "./ordering.functions-DumYUAf3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-Cms0Rnji.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PIN_KEY = "sable-kitchen-pin";
function AdminPage() {
	const [pin, setPin] = (0, import_react.useState)("");
	const [authed, setAuthed] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [view, setView] = (0, import_react.useState)("orders");
	const [orders, setOrders] = (0, import_react.useState)([]);
	const [menu, setMenu] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)({
		id: "",
		name: "",
		blurb: "",
		price: "",
		category: "Plates",
		available: true
	});
	(0, import_react.useEffect)(() => {
		const saved = sessionStorage.getItem(PIN_KEY);
		if (saved) {
			setPin(saved);
			unlock(saved);
		}
	}, []);
	async function unlock(nextPin) {
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
	(0, import_react.useEffect)(() => {
		if (!authed) return;
		const timer = window.setInterval(() => {
			reload().catch(() => void 0);
		}, 8e3);
		return () => window.clearInterval(timer);
	}, [authed, pin]);
	async function advance(code, status) {
		await setOrderStatus({ data: {
			pin,
			code,
			status
		} });
		await reload();
	}
	async function save(event) {
		event.preventDefault();
		const priceCents = Math.round(Number(draft.price) * 100);
		if (!draft.name.trim() || Number.isNaN(priceCents)) return;
		await saveDish({ data: {
			pin,
			id: draft.id || void 0,
			name: draft.name,
			blurb: draft.blurb,
			priceCents,
			category: draft.category,
			available: draft.available
		} });
		setDraft({
			id: "",
			name: "",
			blurb: "",
			price: "",
			category: "Plates",
			available: true
		});
		await reload();
	}
	if (!authed) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-ink px-4 text-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "w-full max-w-sm",
			onSubmit: (event) => {
				event.preventDefault();
				unlock(pin);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm uppercase tracking-widest text-copper",
					children: "Kitchen"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-4xl",
					children: "Sable Table"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-line",
					children: "Staff pin for this demo is 1847."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: pin,
					onChange: (event) => setPin(event.target.value),
					inputMode: "numeric",
					className: "mt-6 min-h-12 w-full rounded-full bg-surface px-4 text-ink outline-none",
					placeholder: "Pin",
					"aria-label": "Kitchen pin"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-copper",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "mt-4 min-h-12 w-full rounded-full bg-copper text-sm font-medium text-surface",
					children: "Open the pass"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-4 block text-center text-sm text-line",
					children: "Back to the menu"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "border-b border-line bg-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-copper",
					children: "Kitchen"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl",
					children: "Sable Table"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setView("orders"),
							className: `min-h-11 rounded-full px-4 text-sm ${view === "orders" ? "bg-ink text-surface" : "border border-line"}`,
							children: "Tickets"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setView("menu"),
							className: `min-h-11 rounded-full px-4 text-sm ${view === "menu" ? "bg-ink text-surface" : "border border-line"}`,
							children: "Menu"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm",
							children: "Guest view"
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-5xl px-4 py-6",
			children: view === "orders" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "space-y-3",
				children: [orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-muted",
					children: "No tickets yet."
				}) : null, orders.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-card border border-line bg-surface p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-3xl tracking-widest",
								children: ticket.code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									statusLabel(ticket.status),
									" · ",
									money(ticket.totalCents)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm",
								children: ticket.items.map((line) => `${line.qty}× ${line.name}`).join(", ")
							}),
							ticket.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: ticket.note
							}) : null
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: ticket.status === status,
								onClick: () => void advance(ticket.code, status),
								className: `min-h-11 rounded-full px-3 text-sm ${ticket.status === status ? "bg-olive text-surface" : "border border-line"}`,
								children: statusLabel(status)
							}, status))
						})]
					})
				}, ticket.code))]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => void save(event),
					className: "rounded-card border border-line bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: draft.id ? "Edit dish" : "New dish"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-4 block text-sm",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: draft.name,
							onChange: (e) => setDraft({
								...draft,
								name: e.target.value
							}),
							className: "mt-1 min-h-11 w-full rounded-xl border border-line px-3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-3 block text-sm",
							children: "Description"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: draft.blurb,
							onChange: (e) => setDraft({
								...draft,
								blurb: e.target.value
							}),
							className: "mt-1 min-h-11 w-full rounded-xl border border-line px-3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-3 block text-sm",
							children: "Price (dollars)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: draft.price,
							onChange: (e) => setDraft({
								...draft,
								price: e.target.value
							}),
							inputMode: "decimal",
							className: "mt-1 min-h-11 w-full rounded-xl border border-line px-3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "mt-3 block text-sm",
							children: "Section"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: draft.category,
							onChange: (e) => setDraft({
								...draft,
								category: e.target.value
							}),
							className: "mt-1 min-h-11 w-full rounded-xl border border-line px-3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "mt-4 min-h-11 rounded-full bg-copper px-5 text-sm font-medium text-surface",
							children: "Save dish"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: menu.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-card border border-line bg-surface p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									item.category,
									" · ",
									money(item.priceCents),
									" · ",
									item.available ? "On" : "Off"
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 rounded-full border border-line px-3 text-sm",
									onClick: () => setDraft({
										id: item.id,
										name: item.name,
										blurb: item.blurb,
										price: (item.priceCents / 100).toFixed(2),
										category: item.category,
										available: item.available
									}),
									children: "Edit"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 rounded-full border border-line px-3 text-sm",
									onClick: () => void setDishAvailable({ data: {
										pin,
										id: item.id,
										available: !item.available
									} }).then(() => reload()),
									children: item.available ? "Hide" : "Show"
								})]
							})]
						})
					}, item.id))
				})]
			})
		})]
	});
}
//#endregion
export { AdminPage as component };
