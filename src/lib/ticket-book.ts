const KEY = "sable-table-tickets";

export function readCodes(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((code): code is string => typeof code === "string");
  } catch {
    return [];
  }
}

export function rememberCode(code: string) {
  const next = [code, ...readCodes().filter((c) => c !== code)].slice(0, 40);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function forgetCode(code: string) {
  localStorage.setItem(KEY, JSON.stringify(readCodes().filter((c) => c !== code)));
}
