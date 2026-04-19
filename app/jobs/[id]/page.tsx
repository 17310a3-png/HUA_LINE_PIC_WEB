"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

  if (err) return <main className="p-6"><p className="text-red-600">{err}</p></main>;
  if (!job) return <main className="p-6">載入中…</main>;

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">{job.set_name}</h1>
      <p className="text-sm text-neutral-600">
        狀態：<b>{job.status}</b> · {job.total} 張
      </p>

      {job.status === "generating" && (
        <p className="text-yellow-700">生圖中，請稍候 2–3 分鐘…</p>
      )}

      {job.sheets && job.sheets.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {job.sheets.map((s) => (
            <img
              key={s.sheet_number}
              src={s.signed_url}
              alt={`sheet ${s.sheet_number}`}
              className="rounded border"
            />
          ))}
        </div>
      )}

      {job.status === "review" && (
        <div className="flex gap-3">
          <button onClick={confirm} disabled={busy}
                  className="flex-1 rounded bg-green-600 py-2 text-white disabled:opacity-50">
            確認裁切
          </button>
          <button onClick={reject} disabled={busy}
                  className="flex-1 rounded bg-red-600 py-2 text-white disabled:opacity-50">
            拒絕重發
          </button>
        </div>
      )}

      {job.status === "finalizing" && (
        <p className="text-purple-700">裁切打包中…</p>
      )}

      {job.status === "done" && job.zip_url && (
        <a href={job.zip_url} download
           className="block w-full rounded bg-blue-600 py-2 text-center text-white">
          下載 ZIP
        </a>
      )}

      {job.status === "expired" && (
        <p className="text-neutral-500">已過期，檔案已清除。</p>
      )}
      {job.error && <p className="text-sm text-red-600">{job.error}</p>}
    </main>
  );
}
