import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ClipboardList } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ticket-book-D1msjIEq.js
var import_jsx_runtime = require_jsx_runtime();
function SiteHeader({ cartCount, onCart }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl text-ink",
					children: "Sable Table"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Pickup from the pass"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/orders",
					className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, {
						className: "size-4",
						"aria-hidden": true
					}), "Orders"]
				}), onCart ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onCart,
					className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-copper px-4 text-sm font-medium text-surface",
					children: ["Bag", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-6 place-items-center rounded-full bg-surface text-xs font-semibold text-copper-deep",
						children: cartCount ?? 0
					})]
				}) : null]
			})]
		})
	});
}
var KEY = "sable-table-tickets";
function readCodes() {
	if (typeof localStorage === "undefined") return [];
	try {
		const raw = localStorage.getItem(KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((code) => typeof code === "string");
	} catch {
		return [];
	}
}
function rememberCode(code) {
	const next = [code, ...readCodes().filter((c) => c !== code)].slice(0, 40);
	localStorage.setItem(KEY, JSON.stringify(next));
}
function forgetCode(code) {
	localStorage.setItem(KEY, JSON.stringify(readCodes().filter((c) => c !== code)));
}
//#endregion
export { rememberCode as i, forgetCode as n, readCodes as r, SiteHeader as t };
