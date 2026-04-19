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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    apiJson("/jobs")
      .then((d) => setJobs(d.jobs ?? d))
      .catch((e) => setErr(String(e.message)));
  }, []);

  const filtered = jobs?.filter((j) =>
    filter === "all" ? true : filter === "done" ? j.status === "done" : j.status !== "done"
  );

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-10">
      <header className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            My Workshop
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
            我的<span className="handwritten-italic">貼圖套組</span>
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            每一組都是一段獨一無二的角色故事。
          </p>
        </div>
        <Link href="/new" className="btn-primary shrink-0">
          ＋ 建立新套組
        </Link>
      </header>

      <nav className="mb-6 flex gap-2">
        {[
          { k: "all", t: "全部" },
          { k: "active", t: "進行中" },
          { k: "done", t: "已完成" }
        ].map((o) => (
          <button
            key={o.k}
            onClick={() => setFilter(o.k)}
            className={
              filter === o.k
                ? "rounded-full bg-primary-gradient px-5 py-2 text-sm font-semibold text-on-primary"
                : "rounded-full bg-surface-container-low px-5 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
            }
          >
            {o.t}
          </button>
        ))}
      </nav>

      {err && (
        <div className="rounded-md bg-error-container px-4 py-3 text-sm text-on-error-container">
          {err}
        </div>
      )}

      {!jobs && !err && <SkeletonList />}

      {filtered?.length === 0 && <EmptyState />}

      <ul className="space-y-5">
        {filtered?.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </ul>
    </main>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <li>
      <Link
        href={`/jobs/${job.id}`}
        className="group block rounded-lg bg-surface-container-lowest p-6 shadow-soft-elevation transition hover:-translate-y-0.5 hover:shadow-soft-lift"
      >
        <div className="mb-3 flex items-center gap-3">
          <StatusChip status={job.status} />
          <span className="text-xs text-on-surface-variant">
            {new Date(job.created_at).toLocaleDateString("zh-TW", {
              month: "short",
              day: "numeric"
            })}
          </span>
        </div>
        <h2 className="mb-1 text-2xl font-bold tracking-tight text-on-surface">
          {job.set_name}
        </h2>
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>{job.total} 張貼圖</span>
          <ExpiryNote expiresAt={job.expires_at} />
        </div>
      </Link>
    </li>
  );
}

function StatusChip({ status }: { status: string }) {
  const tone: Record<string, string> = {
    done: "bg-primary-container text-on-primary",
    review: "bg-secondary-container text-on-secondary-container",
    generating: "bg-tertiary-container text-on-tertiary-container",
    finalizing: "bg-tertiary-container text-on-tertiary-container",
    pending: "bg-surface-container-high text-on-surface-variant",
    expired: "bg-surface-container-high text-on-surface-variant/70",
    rejected: "bg-error-container text-on-error-container",
    failed: "bg-error-container text-on-error-container"
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        tone[status] ?? "bg-surface-container-high text-on-surface-variant"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function ExpiryNote({ expiresAt }: { expiresAt: string }) {
  const days = Math.max(0, Math.floor((+new Date(expiresAt) - Date.now()) / 86400000));
  if (days <= 0) return <span className="opacity-50">已過期</span>;
  return <span>{days} 天後自動清除</span>;
}

function SkeletonList() {
  return (
    <ul className="space-y-5">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-28 animate-pulse rounded-lg bg-surface-container-low"
        />
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg bg-surface-container-low p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
        <span className="text-2xl">🎨</span>
      </div>
      <p className="mb-1 text-lg font-semibold text-on-surface">
        還沒有套組
      </p>
      <p className="mb-6 text-sm text-on-surface-variant">
        點下方按鈕建立你的第一組角色貼圖。
      </p>
      <Link href="/new" className="btn-primary inline-flex">
        開始創作
      </Link>
    </div>
  );
}
