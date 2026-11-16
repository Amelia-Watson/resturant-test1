//#region node_modules/.nitro/vite/services/ssr/assets/order-model-Dciu5wMp.js
var STATUSES = [
	"pending",
	"preparing",
	"ready",
	"collected"
];
function money(cents) {
	return `$${(cents / 100).toFixed(2)}`;
}
function statusLabel(status) {
	if (status === "pending") return "Received";
	if (status === "preparing") return "On the fire";
	if (status === "ready") return "Ready";
	return "Collected";
}
//#endregion
export { money as n, statusLabel as r, STATUSES as t };
