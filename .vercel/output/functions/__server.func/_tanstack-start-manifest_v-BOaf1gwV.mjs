//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-BOaf1gwV.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspace/src/routes/__root.tsx",
		children: [
			"/",
			"/admin",
			"/orders"
		],
		preloads: ["/assets/index-Df4brU4u.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-Df4brU4u.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-C1fIjKWg.js",
			"/assets/order-model-DL9r3Jj4.js",
			"/assets/ticket-book-Bv6cgSmO.js"
		]
	},
	"/admin": {
		filePath: "/workspace/src/routes/admin.tsx",
		children: void 0,
		preloads: ["/assets/admin-BTejmVU3.js", "/assets/order-model-DL9r3Jj4.js"]
	},
	"/orders": {
		filePath: "/workspace/src/routes/orders.tsx",
		children: void 0,
		preloads: [
			"/assets/orders-DGIppZXE.js",
			"/assets/order-model-DL9r3Jj4.js",
			"/assets/ticket-book-Bv6cgSmO.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
