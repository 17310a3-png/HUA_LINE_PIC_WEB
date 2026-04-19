"use client";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "line" as any,
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-bold">LINE 貼圖工作台</h1>
        <p className="text-center text-sm text-neutral-500">登入後才能建立套組</p>
        <button
          onClick={handleLogin}
          className="w-full rounded bg-green-500 py-3 font-medium text-white hover:bg-green-600"
        >
          用 LINE 登入
        </button>
      </div>
    </main>
  );
}
