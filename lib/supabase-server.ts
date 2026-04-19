import { cookies } from "next/headers";
import { createServerClient as createSsr } from "@supabase/ssr";

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
        setAll(all) {
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
