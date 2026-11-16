import { t as STATUSES } from "./order-model-Dciu5wMp.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as number, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ordering.functions-DumYUAf3.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var lineInput = object({
	id: string().min(1).max(40),
	qty: number().int().min(1).max(12)
});
var listMenu = createServerFn({ method: "GET" }).handler(createSsrRpc("09b6778e0a92e20b76d2947e070b00d220204aca07b2cf10e6440193d89a0799"));
var placeOrder = createServerFn({ method: "POST" }).validator(object({
	items: array(lineInput).min(1).max(20),
	note: string().max(140).optional()
})).handler(createSsrRpc("f314dd3ffedf054a52f15c96b8c13b873dc73647b2c8801ce01391805741b638"));
var getTickets = createServerFn({ method: "POST" }).validator(object({ codes: array(string().min(4).max(8)).max(40) })).handler(createSsrRpc("3a6179c5d8184408bb24f6557d06962276348e3c65083893496d4a3c5806b841"));
var kitchenOrders = createServerFn({ method: "POST" }).validator(object({ pin: string() })).handler(createSsrRpc("2b2c6e38b5344824fc25781850891a95e764ac5b0931c73f4c5318a9af8c9108"));
var setOrderStatus = createServerFn({ method: "POST" }).validator(object({
	pin: string(),
	code: string().min(4).max(8),
	status: _enum(STATUSES)
})).handler(createSsrRpc("f803c5fd17a7552471861efd5fc8b1ce77f2ab794d13f6fdc37dcd2001fdc7e0"));
var saveDish = createServerFn({ method: "POST" }).validator(object({
	pin: string(),
	id: string().min(1).max(40).optional(),
	name: string().min(1).max(60),
	blurb: string().max(140),
	priceCents: number().int().min(0).max(5e4),
	category: string().min(1).max(24),
	available: boolean()
})).handler(createSsrRpc("5e9d58e40d94d382fc9c47d074abfc79a765ea25b8d7d6dc89b2acd5861d6895"));
var setDishAvailable = createServerFn({ method: "POST" }).validator(object({
	pin: string(),
	id: string(),
	available: boolean()
})).handler(createSsrRpc("ada4c278fd091c2bc5095735b2e907842fac852e34cce5572bad270a54be5561"));
//#endregion
export { saveDish as a, placeOrder as i, kitchenOrders as n, setDishAvailable as o, listMenu as r, setOrderStatus as s, getTickets as t };
