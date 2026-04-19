import { cookies } from "next/headers";
import { createServerClient as createSsr, type CookieOptions } from "@supabase/ssr";

type CookieItem = { name: string; value: string; options: CookieOptions };

export async function createServerClient() {
  const cookieStore = await cookies();
  return createSsr(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(all: CookieItem[]) {
          try {
            all.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
          }
        }
      }
    }
  );
}
