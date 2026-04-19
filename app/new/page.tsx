"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { apiForm } from "@/lib/api";

type Series = { id: string; name: string };

export default function NewJobPage() {
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [total, setTotal] = useState<number>(40);
  const [model, setModel] = useState<"flash" | "pro">("flash");
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase
      .from("series")
      .select("id, name")
      .then(({ data }) => {
        if (data) setSeries(data as Series[]);
      });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const form = new FormData(e.currentTarget);
      const res = await apiForm("/jobs", form);
      router.push(`/jobs/${res.job_id}`);
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-8">
      <Link
        href="/jobs"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-on-primary-container"
      >
        ← 回到我的套組
      </Link>

      <Stepper current={1} />

      <header className="mb-10 mt-8">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-on-surface">
          建立新的<br />
          <span className="handwritten-italic">貼圖套組</span>
        </h1>
        <p className="mt-3 text-base leading-relaxed text-on-surface-variant">
          告訴我們你的角色，我們把草稿化為 LINE 可上架的完整套組。
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="rounded-lg bg-surface-container p-6">
          <h2 className="mb-1 font-handwritten text-2xl italic text-primary">
            Studio Identity
          </h2>
          <p className="mb-5 text-sm text-on-surface-variant">
            為你的套組命名並決定角色。
          </p>
          <Field name="set_name" label="套組代號（英文 slug）" placeholder="otter_office" required />
          <Field name="character_name" label="角色中文名" placeholder="水獺小班" required />
          <Field
            name="character_prompt"
            label="角色外觀描述"
            textarea
            required
            placeholder="例：一隻戴著西裝領帶的水獺，圓眼、笑臉"
          />
          <Field
            name="style"
            label="風格描述（選填）"
            textarea
            placeholder="例：手繪風、暖色系、日系可愛"
          />
        </section>

        <section className="rounded-lg bg-surface-container p-6">
          <h2 className="mb-1 font-handwritten text-2xl italic text-primary">
            Canvas Details
          </h2>
          <p className="mb-5 text-sm text-on-surface-variant">
            選擇文案系列與產出規格。
          </p>

          <div className="mb-5">
            <label className="field-label">文案系列</label>
            <div className="flex flex-wrap gap-2">
              {series.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSeries(s.id)}
                  className={
                    selectedSeries === s.id
                      ? "rounded-full bg-secondary-gradient px-4 py-2 text-sm font-semibold text-on-secondary shadow-soft-elevation"
                      : "rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
                  }
                >
                  {s.name}
                </button>
              ))}
              {series.length === 0 && (
                <span className="text-sm text-on-surface-variant">載入文案中…</span>
              )}
            </div>
            <input type="hidden" name="series_id" value={selectedSeries} required />
          </div>

          <div className="mb-5">
            <label className="field-label">貼圖張數</label>
            <div className="grid grid-cols-5 gap-2">
              {[8, 16, 24, 32, 40].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setTotal(n)}
                  className={
                    total === n
                      ? "rounded-md bg-primary-gradient py-3 font-bold text-on-primary"
                      : "rounded-md bg-surface-container-lowest py-3 font-semibold text-on-surface-variant hover:bg-surface-container-high"
                  }
                >
                  {n}
                </button>
              ))}
            </div>
            <input type="hidden" name="total" value={total} />
          </div>

          <div>
            <label className="field-label">模型</label>
            <div className="grid grid-cols-2 gap-3">
              <ModelOption
                active={model === "flash"}
                onClick={() => setModel("flash")}
                title="Flash"
                sub="快速 · $0.27 / 套"
              />
              <ModelOption
                active={model === "pro"}
                onClick={() => setModel("pro")}
                title="Pro"
                sub="高品質 · $0.80 / 套"
              />
            </div>
            <input type="hidden" name="model" value={model} />
          </div>
        </section>

        <section className="rounded-lg bg-surface-container p-6">
          <h2 className="mb-1 font-handwritten text-2xl italic text-primary">
            Reference Sketch
          </h2>
          <p className="mb-5 text-sm text-on-surface-variant">
            上傳角色參考圖（任一張清楚的正面圖即可）。
          </p>

          <label className="block cursor-pointer rounded-lg bg-surface-container-lowest p-8 text-center transition hover:bg-surface-bright">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed">
              <span className="text-2xl">🖌️</span>
            </div>
            <p className="mb-1 font-semibold text-on-surface">
              {fileName || "點擊上傳圖片"}
            </p>
            <p className="text-xs text-on-surface-variant">
              PNG / JPG · 建議 1024×1024 以上
            </p>
            <input
              type="file"
              name="reference_image"
              accept="image/*"
              required
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            />
          </label>
        </section>

        <aside className="flex gap-3 rounded-lg bg-primary-fixed/60 p-5 text-sm leading-relaxed text-on-primary-container">
          <span className="text-lg">✨</span>
          <div>
            <b>Artisan Tip：</b>
            清晰的單色背景 + 正面角度的草稿，能讓 AI 抓到角色特徵最穩定。
          </div>
        </aside>

        {err && (
          <div className="rounded-md bg-error-container px-4 py-3 text-sm text-on-error-container">
            {err}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-secondary w-full py-4 text-lg">
          {loading ? "送出中…" : "🚀 生成我的貼圖"}
        </button>
        <p className="text-center text-xs text-on-surface-variant">
          預估生成時間 約 2–3 分鐘
        </p>
      </form>
    </main>
  );
}

function Field(props: {
  name: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="field-label">{props.label}</label>
      {props.textarea ? (
        <textarea
          name={props.name}
          placeholder={props.placeholder}
          required={props.required}
          rows={3}
          className="field-input resize-none"
        />
      ) : (
        <input
          type="text"
          name={props.name}
          placeholder={props.placeholder}
          required={props.required}
          className="field-input"
        />
      )}
    </div>
  );
}

function ModelOption(props: {
  active: boolean;
  onClick: () => void;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={
        props.active
          ? "rounded-md bg-primary-gradient px-4 py-3 text-left text-on-primary"
          : "rounded-md bg-surface-container-lowest px-4 py-3 text-left text-on-surface-variant hover:bg-surface-container-high"
      }
    >
      <div className="text-base font-bold">{props.title}</div>
      <div className={props.active ? "text-xs opacity-90" : "text-xs"}>{props.sub}</div>
    </button>
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
