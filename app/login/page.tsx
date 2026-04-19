"use client";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${location.origin}/auth/callback` }
    });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary-fixed/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-secondary-container/20 blur-3xl" />

      <section className="relative z-10 w-full max-w-sm rounded-lg bg-surface-container-lowest p-10 shadow-soft-lift">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Sticker Studio
        </p>
        <h1 className="mb-2 text-4xl font-extrabold leading-tight tracking-tight text-on-surface">
          歡迎回到<br />
          <span className="handwritten-italic">工作室</span>
        </h1>
        <p className="mb-10 text-sm leading-relaxed text-on-surface-variant">
          登入後即可建立屬於你角色的 LINE 貼圖套組，從草稿到上架一站完成。
        </p>

        <button onClick={handleLogin} className="btn-primary w-full">
          <GithubIcon />
          用 GitHub 登入
        </button>

        <p className="mt-6 text-center text-xs text-on-surface-variant/80">
          僅用於辨識身分 · 不會存取你的 repo
        </p>
      </section>
    </main>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.11.78-.25.78-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.3-1.68-1.3-1.68-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.74-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.77.11 3.07.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.79.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
