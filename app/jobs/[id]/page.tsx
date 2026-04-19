"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiJson } from "@/lib/api";

type Sheet = { sheet_number: number; signed_url: string };
type JobDetail = {
  id: string;
  set_name: string;
  status: string;
  total: number;
  expires_at: string;
  sheets: Sheet[];
  zip_url?: string;
  error?: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "待啟動",
  generating: "生成中",
  review: "待審核",
  finalizing: "裁切中",
  done: "已完成",
  expired: "已過期",
  rejected: "已退回",
  failed: "失敗"
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const d = await apiJson(`/jobs/${id}`);
      setJob(d);
    } catch (e: any) {
      setErr(String(e.message));
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [id]);

  async function confirm() {
    setBusy(true);
    try {
      await apiJson(`/jobs/${id}/finalize`, { method: "POST" });
      load();
    } catch (e: any) {
      setErr(String(e.message));
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true);
    try {
      await apiJson(`/jobs/${id}/reject`, { method: "POST" });
      load();
    } catch (e: any) {
      setErr(String(e.message));
    } finally {
      setBusy(false);
    }
  }

  const currentStep: 1 | 2 | 3 =
    job?.status === "done"
      ? 3
      : job?.status === "review" || job?.status === "finalizing"
      ? 3
      : 2;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-8">
      <Link
        href="/jobs"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-on-primary-container"
      >
        ← 回到我的套組
      </Link>

      <Stepper current={currentStep} />

      {!job && !err && (
        <div className="mt-10 h-40 animate-pulse rounded-lg bg-surface-container-low" />
      )}

      {err && (
        <div className="mt-10 rounded-md bg-error-container px-4 py-3 text-sm text-on-error-container">
          {err}
        </div>
      )}

      {job && (
        <>
          <header className="mb-8 mt-8 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Sticker Set
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
                <span className="handwritten-italic">{job.set_name}</span>
              </h1>
              <p className="mt-2 text-sm text-on-surface-variant">
                {job.total} 張貼圖 · <StatusInline status={job.status} />
              </p>
            </div>
          </header>

          {job.status === "generating" && (
            <StatusCard
              emoji="✨"
              title="生圖中"
              desc="AI 正在描繪你的角色，預估 2–3 分鐘。這頁會自動更新。"
            />
          )}

          {job.status === "finalizing" && (
            <StatusCard
              emoji="✂️"
              title="裁切打包中"
              desc="正在切出每張貼圖並打包成 ZIP，稍候片刻。"
            />
          )}

          {job.status === "expired" && (
            <StatusCard
              emoji="🗂️"
              title="已過期"
              desc="檔案已自動清除。建立新套組可以重新生成。"
            />
          )}

          {job.status === "rejected" && (
            <StatusCard
              emoji="↩️"
              title="已退回"
              desc="你已拒絕這批原稿，可以重新建立套組。"
            />
          )}

          {job.sheets && job.sheets.length > 0 && (
            <section className="mt-2">
              <h2 className="mb-4 font-handwritten text-2xl italic text-primary">
                Draft Sheets
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {job.sheets.map((s) => (
                  <div
                    key={s.sheet_number}
                    className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-soft-elevation"
                  >
                    <img
                      src={s.signed_url}
                      alt={`sheet ${s.sheet_number}`}
                      className="block aspect-square w-full object-cover"
                    />
                    <div className="px-3 py-2 text-xs font-semibold text-on-surface-variant">
                      Sheet {s.sheet_number}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {job.status === "review" && (
            <section className="mt-8 space-y-4">
              <aside className="flex gap-3 rounded-lg bg-primary-fixed/60 p-5 text-sm leading-relaxed text-on-primary-container">
                <span className="text-lg">🧐</span>
                <div>
                  <b>Artisan Review：</b>
                  確認角色一致、動作清晰後按下「確認裁切」，系統會切出 {job.total} 張並打包 ZIP。
                </div>
              </aside>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={confirm}
                  disabled={busy}
                  className="btn-secondary flex-1 py-4 text-base"
                >
                  {busy ? "處理中…" : "✅ 確認裁切"}
                </button>
                <button
                  onClick={reject}
                  disabled={busy}
                  className="btn-ghost flex-1 py-4 text-base"
                >
                  ↩️ 拒絕重發
                </button>
              </div>
            </section>
          )}

          {job.status === "done" && job.zip_url && (
            <section className="mt-8 space-y-3">
              <a
                href={job.zip_url}
                download
                className="btn-primary flex w-full items-center justify-center py-4 text-lg"
              >
                ⬇️ 下載 ZIP
              </a>
              <p className="text-center text-xs text-on-surface-variant">
                檔案將於到期日後自動從我們的儲存移除，請儘早下載保存。
              </p>
            </section>
          )}

          {job.error && (
            <div className="mt-6 rounded-md bg-error-container px-4 py-3 text-sm text-on-error-container">
              {job.error}
            </div>
          )}
        </>
      )}
    </main>
  );
}

function StatusInline({ status }: { status: string }) {
  return (
    <span className="font-semibold text-on-surface">
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function StatusCard({
  emoji,
  title,
  desc
}: {
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <section className="mb-8 flex gap-4 rounded-lg bg-surface-container p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-2xl">
        {emoji}
      </div>
      <div>
        <h2 className="mb-1 text-lg font-bold text-on-surface">{title}</h2>
        <p className="text-sm leading-relaxed text-on-surface-variant">{desc}</p>
      </div>
    </section>
  );
}

function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "設定" },
    { n: 2, label: "生成" },
    { n: 3, label: "審核" }
  ];
  return (
    <ol className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = current > s.n;
        const active = current === s.n;
        return (
          <li key={s.n} className="flex items-center gap-3">
            <div
              className={
                active
                  ? "flex h-9 w-9 items-center justify-center rounded-full bg-primary-gradient text-sm font-bold text-on-primary"
                  : done
                  ? "flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary"
                  : "flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-sm font-bold text-on-surface-variant"
              }
            >
              {done ? "✓" : s.n}
            </div>
            <span
              className={
                active
                  ? "text-xs font-bold uppercase tracking-wider text-primary"
                  : "text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              }
            >
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="h-0.5 w-6 bg-outline-variant/40" />}
          </li>
        );
      })}
    </ol>
  );
}
