// إدارة الجلسة: رمز موقَّع بـ HMAC (SHA-256) عبر Web Crypto ليعمل في بيئتي
// الخادم (Node) والوسيط (Edge) دون الحاجة لمكتبات خارجية.
const SESSION_COOKIE_NAME = "kanwal_session";
const SECRET = process.env.AUTH_SECRET || "kanwal-dev-secret-change-me";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 أيام بالثواني

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const bin = atob(str + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64url(sig);
}

export async function createSessionToken(
  userId: string,
  username: string
): Promise<string> {
  const payload = {
    u: userId,
    n: username,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const data = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await sign(data);
  return `${data}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<{ userId: string; username: string } | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = await sign(data);
  if (expected.length !== sig.length) return null;
  const a = enc.encode(expected);
  const b = enc.encode(sig);
  let ok = true;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) ok = false;
  if (!ok) return null;
  try {
    const json = dec.decode(b64urlDecode(data));
    const payload = JSON.parse(json) as { u: string; n: string; exp: number };
    if (!payload.exp || payload.exp < Date.now()) return null;
    return { userId: payload.u, username: payload.n };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE };