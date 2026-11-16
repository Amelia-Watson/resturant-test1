import { t as STATUSES } from "./order-model-Dciu5wMp.mjs";
import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as number, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ordering.functions-BChGP4C_.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_ordering_default = "create table if not exists menu_items (\n  id text primary key,\n  name text not null,\n  blurb text not null,\n  price_cents integer not null,\n  category text not null,\n  available boolean not null default true,\n  sort integer not null default 0\n);\n\ncreate table if not exists orders (\n  code text primary key,\n  items text not null,\n  total_cents integer not null,\n  note text not null default '',\n  status text not null default 'pending',\n  created_at timestamptz not null default now()\n);\n\ninsert into menu_items (id, name, blurb, price_cents, category, sort) values\n  ('half-chicken', 'Half chicken', 'Charred lemon, rosemary, browned butter.', 2400, 'Plates', 1),\n  ('pappardelle', 'Rye pappardelle', 'Brown butter, sage, pecorino.', 2100, 'Plates', 2),\n  ('fennel', 'Citrus fennel', 'Blood orange, pistachio, olive oil.', 1400, 'Garden', 3),\n  ('broccolini', 'Charred broccolini', 'Chili, garlic, lemon zest.', 1100, 'Garden', 4),\n  ('ricotta', 'Herb ricotta toast', 'Grilled sourdough, chili honey.', 1200, 'Bread', 5),\n  ('chocolate', 'Dark chocolate pot', 'Flaky salt, warm cream.', 900, 'Sweets', 6),\n  ('cake', 'Olive oil cake', 'Orange peel, barely sweet.', 800, 'Sweets', 7),\n  ('cooler', 'Rosemary cooler', 'Sparkling citrus, crushed ice.', 600, 'Sips', 8)\non conflict (id) do nothing;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_ordering.sql": _0002_ordering_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var PIN = "1847";
function mapMenu(row) {
	return {
		id: row.id,
		name: row.name,
		blurb: row.blurb,
		priceCents: Number(row.price_cents),
		category: row.category,
		available: Boolean(row.available)
	};
}
function mapTicket(row) {
	const items = JSON.parse(row.items);
	const status = STATUSES.includes(row.status) ? row.status : "pending";
	return {
		code: row.code,
		items,
		totalCents: Number(row.total_cents),
		note: row.note,
		status,
		createdAt: row.created_at
	};
}
function ticketCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const bytes = /* @__PURE__ */ new Uint8Array(5);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => alphabet[b % 32]).join("");
}
var lineInput = object({
	id: string().min(1).max(40),
	qty: number().int().min(1).max(12)
});
var listMenu_createServerFn_handler = createServerRpc({
	id: "09b6778e0a92e20b76d2947e070b00d220204aca07b2cf10e6440193d89a0799",
	name: "listMenu",
	filename: "src/lib/ordering.functions.ts"
}, (opts) => listMenu.__executeServer(opts));
var listMenu = createServerFn({ method: "GET" }).handler(listMenu_createServerFn_handler, async () => {
	return (await (await getSql())`
    select id, name, blurb, price_cents, category, available
    from menu_items
    order by sort, name
  `).map(mapMenu);
});
var placeOrder_createServerFn_handler = createServerRpc({
	id: "f314dd3ffedf054a52f15c96b8c13b873dc73647b2c8801ce01391805741b638",
	name: "placeOrder",
	filename: "src/lib/ordering.functions.ts"
}, (opts) => placeOrder.__executeServer(opts));
var placeOrder = createServerFn({ method: "POST" }).validator(object({
	items: array(lineInput).min(1).max(20),
	note: string().max(140).optional()
})).handler(placeOrder_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const menu = await sql`
      select id, name, blurb, price_cents, category, available from menu_items
    `;
	const byId = new Map(menu.map((row) => [row.id, row]));
	const lines = [];
	for (const item of data.items) {
		const dish = byId.get(item.id);
		if (!dish || !dish.available) throw new Error("Something on the ticket is no longer available.");
		lines.push({
			id: dish.id,
			name: dish.name,
			priceCents: Number(dish.price_cents),
			qty: item.qty
		});
	}
	const totalCents = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
	const note = (data.note ?? "").trim();
	let code = ticketCode();
	for (let attempt = 0; attempt < 5; attempt++) {
		if ((await sql`select code from orders where code = ${code}`).length === 0) break;
		code = ticketCode();
	}
	await sql`
      insert into orders (code, items, total_cents, note, status)
      values (${code}, ${JSON.stringify(lines)}, ${totalCents}, ${note}, 'pending')
    `;
	return {
		code,
		totalCents
	};
});
var getTickets_createServerFn_handler = createServerRpc({
	id: "3a6179c5d8184408bb24f6557d06962276348e3c65083893496d4a3c5806b841",
	name: "getTickets",
	filename: "src/lib/ordering.functions.ts"
}, (opts) => getTickets.__executeServer(opts));
var getTickets = createServerFn({ method: "POST" }).validator(object({ codes: array(string().min(4).max(8)).max(40) })).handler(getTickets_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const tickets = [];
	const seen = /* @__PURE__ */ new Set();
	for (const raw of data.codes) {
		const code = raw.trim().toUpperCase();
		if (seen.has(code)) continue;
		seen.add(code);
		const rows = await sql`
        select code, items, total_cents, note, status, created_at::text as created_at
        from orders where code = ${code}
      `;
		if (rows[0]) tickets.push(mapTicket(rows[0]));
	}
	return tickets;
});
function assertPin(pin) {
	if (pin !== PIN) throw new Error("That pin does not open the kitchen.");
}
var kitchenOrders_createServerFn_handler = createServerRpc({
	id: "2b2c6e38b5344824fc25781850891a95e764ac5b0931c73f4c5318a9af8c9108",
	name: "kitchenOrders",
	filename: "src/lib/ordering.functions.ts"
}, (opts) => kitchenOrders.__executeServer(opts));
var kitchenOrders = createServerFn({ method: "POST" }).validator(object({ pin: string() })).handler(kitchenOrders_createServerFn_handler, async ({ data }) => {
	assertPin(data.pin);
	return (await (await getSql())`
      select code, items, total_cents, note, status, created_at::text as created_at
      from orders
      order by created_at desc
      limit 80
    `).map(mapTicket);
});
var setOrderStatus_createServerFn_handler = createServerRpc({
	id: "f803c5fd17a7552471861efd5fc8b1ce77f2ab794d13f6fdc37dcd2001fdc7e0",
	name: "setOrderStatus",
	filename: "src/lib/ordering.functions.ts"
}, (opts) => setOrderStatus.__executeServer(opts));
var setOrderStatus = createServerFn({ method: "POST" }).validator(object({
	pin: string(),
	code: string().min(4).max(8),
	status: _enum(STATUSES)
})).handler(setOrderStatus_createServerFn_handler, async ({ data }) => {
	assertPin(data.pin);
	const sql = await getSql();
	const code = data.code.toUpperCase();
	if (!(await sql`
      update orders set status = ${data.status} where code = ${code} returning code
    `)[0]) throw new Error("Ticket not found.");
	return { ok: true };
});
var saveDish_createServerFn_handler = createServerRpc({
	id: "5e9d58e40d94d382fc9c47d074abfc79a765ea25b8d7d6dc89b2acd5861d6895",
	name: "saveDish",
	filename: "src/lib/ordering.functions.ts"
}, (opts) => saveDish.__executeServer(opts));
var saveDish = createServerFn({ method: "POST" }).validator(object({
	pin: string(),
	id: string().min(1).max(40).optional(),
	name: string().min(1).max(60),
	blurb: string().max(140),
	priceCents: number().int().min(0).max(5e4),
	category: string().min(1).max(24),
	available: boolean()
})).handler(saveDish_createServerFn_handler, async ({ data }) => {
	assertPin(data.pin);
	const sql = await getSql();
	const id = data.id ?? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
	await sql`
      insert into menu_items (id, name, blurb, price_cents, category, available, sort)
      values (${id}, ${data.name.trim()}, ${data.blurb.trim()}, ${data.priceCents}, ${data.category.trim()}, ${data.available}, 50)
      on conflict (id) do update set
        name = excluded.name,
        blurb = excluded.blurb,
        price_cents = excluded.price_cents,
        category = excluded.category,
        available = excluded.available
    `;
	return { id };
});
var setDishAvailable_createServerFn_handler = createServerRpc({
	id: "ada4c278fd091c2bc5095735b2e907842fac852e34cce5572bad270a54be5561",
	name: "setDishAvailable",
	filename: "src/lib/ordering.functions.ts"
}, (opts) => setDishAvailable.__executeServer(opts));
var setDishAvailable = createServerFn({ method: "POST" }).validator(object({
	pin: string(),
	id: string(),
	available: boolean()
})).handler(setDishAvailable_createServerFn_handler, async ({ data }) => {
	assertPin(data.pin);
	await (await getSql())`update menu_items set available = ${data.available} where id = ${data.id}`;
	return { ok: true };
});
//#endregion
export { getTickets_createServerFn_handler, kitchenOrders_createServerFn_handler, listMenu_createServerFn_handler, placeOrder_createServerFn_handler, saveDish_createServerFn_handler, setDishAvailable_createServerFn_handler, setOrderStatus_createServerFn_handler };
