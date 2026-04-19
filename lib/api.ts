import { supabaseBrowser } from "./supabase-browser";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

async function authHeaders(): Promise<Record<string, string>> {
  const supabase = supabaseBrowser();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiJson(path: string, init?: RequestInit) {
  const auth = await authHeaders();
  const headers: Record<string, string> = { ...auth };
  if (init?.body && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  Object.assign(headers, init?.headers || {});
  const r = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}

export async function apiForm(path: string, formData: FormData) {
  const headers = await authHeaders();
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers,
    cache: "no-store"
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}
