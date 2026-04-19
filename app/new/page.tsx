"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { apiForm } from "@/lib/api";

type Series = { id: string; name: string };

export default function NewJobPage() {
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
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
    <main className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-bold">建立新套組</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field name="set_name" label="套組名稱 (slug)" placeholder="例：otter_office" required />
        <Field name="character_name" label="角色中文名" placeholder="例：水獺" required />
        <Field name="character_prompt" label="角色描述" textarea required />
        <Field name="style" label="風格描述（選填）" textarea />

        <div>
          <label className="mb-1 block text-sm font-medium">文案系列</label>
          <select name="series_id" required className="w-full rounded border p-2">
            <option value="">-- 選擇 --</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">貼圖張數</label>
            <select name="total" required defaultValue="40" className="w-full rounded border p-2">
              {[8, 16, 24, 32, 40].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">模型</label>
            <select name="model" required defaultValue="flash" className="w-full rounded border p-2">
              <option value="flash">flash (便宜)</option>
              <option value="pro">pro (品質高)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">角色參考圖</label>
          <input type="file" name="reference_image" accept="image/*" required className="w-full" />
        </div>

        {err && <p className="text-sm text-red-600">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
        >
          {loading ? "送出中…" : "送出"}
        </button>
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
  const base = "w-full rounded border p-2";
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{props.label}</label>
      {props.textarea ? (
        <textarea name={props.name} placeholder={props.placeholder} required={props.required} className={base} rows={3} />
      ) : (
        <input type="text" name={props.name} placeholder={props.placeholder} required={props.required} className={base} />
      )}
    </div>
  );
}
