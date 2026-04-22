"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiJson } from "@/lib/api";

type Item = { idx: string; text: string; action: string; shot?: string };
type Series = { id: string; name: string; items: Item[] };

const SHOT_OPTIONS = [
  "特寫",
  "大頭近景",
  "半身正拍",
  "半身側拍",
  "半身俯拍",
  "全身正拍",
  "全身側拍",
  "全身俯拍",
  "全身仰拍",
  "遠景",
  "斜角構圖"
];

export default function AdminSeriesPage() {
  const [all, setAll] = useState<Series[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [filterShot, setFilterShot] = useState<string>("all");

  useEffect(() => {
    apiJson("/admin/series")
      .then((d) => {
        setAll(d.series);
        if (d.series?.[0]) {
          setSelectedId(d.series[0].id);
          setItems(d.series[0].items ?? []);
        }
      })
      .catch((e) => setErr(String(e.message)));
  }, []);

  function selectSeries(id: string) {
    if (dirty && !confirm("有未儲存變更，確定切換？")) return;
    const s = all?.find((x) => x.id === id);
    setSelectedId(id);
    setItems(s?.items ?? []);
    setDirty(false);
    setFilterShot("all");
  }

  function updateItem(i: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
    setDirty(true);
  }

  function deleteItem(i: number) {
    if (!confirm("刪除這則？")) return;
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  }

  function addItem() {
    const nextIdx = String(
      items
        .map((x) => parseInt(x.idx, 10))
        .filter((n) => !isNaN(n))
        .reduce((a, b) => Math.max(a, b), 0) + 1
    ).padStart(2, "0");
    setItems((prev) => [
      ...prev,
      { idx: nextIdx, text: "", action: "", shot: "半身正拍" }
    ]);
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      await apiJson(`/admin/series/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({ items })
      });
      setDirty(false);
      setAll((prev) =>
        prev?.map((s) => (s.id === selectedId ? { ...s, items } : s)) ?? null
      );
    } catch (e: any) {
      setErr(String(e.message));
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    if (filterShot === "all") return items.map((it, i) => ({ it, i }));
    return items
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => (it.shot ?? "") === filterShot);
  }, [items, filterShot]);

  const shotCounts = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach((it) => {
      const k = it.shot ?? "(未設定)";
      m[k] = (m[k] ?? 0) + 1;
    });
    return m;
  }, [items]);

  return (
    <main className="mx-auto max-w-5xl px-6 pb-24 pt-8">
      <Link
        href="/jobs"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-on-primary-container"
      >
        ← 回到我的套組
      </Link>

      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Studio Admin
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
          系列<span className="handwritten-italic">文案庫</span>
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          檢視 / 編輯每個系列的文案 · 動作 · 鏡頭距離
        </p>
      </header>

      {err && (
        <div className="mb-6 rounded-md bg-error-container px-4 py-3 text-sm text-on-error-container">
          {err}
        </div>
      )}

      {!all && !err && (
        <div className="h-40 animate-pulse rounded-lg bg-surface-container-low" />
      )}

      {all && (
        <>
          <nav className="mb-6 flex flex-wrap gap-2">
            {all.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSeries(s.id)}
                className={
                  selectedId === s.id
                    ? "rounded-full bg-secondary-gradient px-4 py-2 text-sm font-semibold text-on-secondary shadow-soft-elevation"
                    : "rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high"
                }
              >
                {s.name}
                <span className="ml-2 opacity-70">{s.items?.length ?? 0}</span>
              </button>
            ))}
          </nav>

          <section className="mb-4 flex flex-wrap items-center gap-3 rounded-lg bg-surface-container p-4">
            <span className="text-sm font-semibold text-on-surface">鏡頭分布</span>
            {Object.entries(shotCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setFilterShot(filterShot === k ? "all" : k)}
                  className={
                    filterShot === k
                      ? "rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-on-primary-container"
                      : "rounded-full bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high"
                  }
                >
                  {k} · {v}
                </button>
              ))}
            {filterShot !== "all" && (
              <button
                onClick={() => setFilterShot("all")}
                className="text-xs text-primary hover:underline"
              >
                清除篩選
              </button>
            )}
          </section>

          <section className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-soft-elevation">
            <div className="grid grid-cols-[56px_1fr_2fr_140px_56px] gap-3 border-b border-outline-variant/30 bg-surface-container px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <div>Idx</div>
              <div>Text</div>
              <div>Action</div>
              <div>Shot</div>
              <div></div>
            </div>
            {filtered.map(({ it, i }) => (
              <div
                key={`${it.idx}-${i}`}
                className="grid grid-cols-[56px_1fr_2fr_140px_56px] items-center gap-3 border-b border-outline-variant/20 px-4 py-2 last:border-b-0"
              >
                <input
                  value={it.idx}
                  onChange={(e) => updateItem(i, { idx: e.target.value })}
                  className="rounded-sm bg-surface-container px-2 py-1 text-sm font-mono text-on-surface"
                />
                <input
                  value={it.text}
                  onChange={(e) => updateItem(i, { text: e.target.value })}
                  className="rounded-sm bg-surface-container px-2 py-1 text-sm text-on-surface"
                />
                <input
                  value={it.action}
                  onChange={(e) => updateItem(i, { action: e.target.value })}
                  className="rounded-sm bg-surface-container px-2 py-1 text-sm text-on-surface"
                />
                <select
                  value={it.shot ?? ""}
                  onChange={(e) => updateItem(i, { shot: e.target.value })}
                  className="rounded-sm bg-surface-container px-2 py-1 text-sm text-on-surface"
                >
                  <option value="">（未設定）</option>
                  {SHOT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteItem(i)}
                  className="rounded-sm px-2 py-1 text-sm text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
                  title="刪除"
                >
                  ✕
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-on-surface-variant">
                這個篩選條件下沒有資料
              </div>
            )}
          </section>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={addItem}
              className="btn-ghost"
            >
              ＋ 新增一則
            </button>
            <div className="flex items-center gap-3">
              {dirty && (
                <span className="text-xs text-primary">● 有未儲存變更</span>
              )}
              <button
                onClick={save}
                disabled={!dirty || saving}
                className="btn-primary"
              >
                {saving ? "儲存中…" : "💾 儲存"}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
