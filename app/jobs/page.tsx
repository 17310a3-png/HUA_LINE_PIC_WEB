"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/lib/api";

type Job = {
  id: string;
  set_name: string;
  status: string;
  total: number;
  created_at: string;
  expires_at: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiJson("/jobs")
      .then((d) => setJobs(d.jobs ?? d))
      .catch((e) => setErr(String(e.message)));
  }, []);

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">我的套組</h1>
        <Link href="/new" className="rounded bg-blue-600 px-4 py-2 text-white">＋ 建立</Link>
      </div>
      {err && <p className="text-red-600">{err}</p>}
      {!jobs && !err && <p>載入中…</p>}
      {jobs?.length === 0 && <p className="text-neutral-600">還沒有套組。</p>}
      <ul className="space-y-2">
        {jobs?.map((j) => (
          <li key={j.id} className="rounded border p-4 hover:bg-neutral-100">
            <Link href={`/jobs/${j.id}`} className="block">
              <div className="flex justify-between">
                <span className="font-medium">{j.set_name}</span>
                <StatusBadge status={j.status} />
              </div>
              <div className="text-sm text-neutral-500">
                {j.total} 張 · 建立於 {new Date(j.created_at).toLocaleString()} · <ExpiryNote expiresAt={j.expires_at} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-neutral-200",
    generating: "bg-yellow-200",
    review: "bg-blue-200",
    finalizing: "bg-purple-200",
    done: "bg-green-200",
    expired: "bg-neutral-300",
    rejected: "bg-red-200",
    failed: "bg-red-200"
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs ${colors[status] ?? "bg-neutral-200"}`}>
      {status}
    </span>
  );
}

function ExpiryNote({ expiresAt }: { expiresAt: string }) {
  const days = Math.max(0, Math.floor((+new Date(expiresAt) - Date.now()) / 86400000));
  return <span>{days} 天後自動清除</span>;
}
