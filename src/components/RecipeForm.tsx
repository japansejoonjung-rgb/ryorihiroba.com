"use client";

import { FormEvent, useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";

export default function RecipeForm() {
  const [ingredients, setIngredients] = useState([{ name: "", amount: "" }]);
  const [steps, setSteps] = useState([""]);

  const addIngredient = () => setIngredients([...ingredients, { name: "", amount: "" }]);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, field: "name" | "amount", value: string) => {
    const next = [...ingredients];
    next[index][field] = value;
    setIngredients(next);
  };
  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, value: string) => {
    const next = [...steps];
    next[index] = value;
    setSteps(next);
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("レシピを投稿しました");
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">基本情報</h2>
        <div className="mt-5 grid gap-5">
          <label className="grid gap-2"><span className="text-sm font-bold">タイトル</span><input required placeholder="例：ふわとろ親子丼" className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /></label>
          <label className="grid gap-2"><span className="text-sm font-bold">代表画像</span><div className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50 text-orange-500"><Upload size={32} /><p className="mt-2 text-sm font-bold">画像をアップロード</p><p className="mt-1 text-xs text-orange-400">MVPではUIのみ実装</p></div></label>
          <label className="grid gap-2"><span className="text-sm font-bold">説明</span><textarea required placeholder="レシピの紹介文を入力してください" className="min-h-32 rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /></label>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2"><span className="text-sm font-bold">調理時間</span><input type="number" min="1" required placeholder="20" className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /></label>
            <label className="grid gap-2"><span className="text-sm font-bold">人数</span><input type="number" min="1" required placeholder="2" className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /></label>
            <label className="grid gap-2"><span className="text-sm font-bold">難易度</span><select className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300"><option>簡単</option><option>普通</option><option>本格</option></select></label>
          </div>
        </div>
      </section>
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">材料</h2><button type="button" onClick={addIngredient} className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-500 hover:bg-orange-100"><span className="inline-flex items-center gap-1"><Plus size={16} />材料追加</span></button></div>
        <div className="mt-5 grid gap-3">{ingredients.map((ingredient, index) => <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input value={ingredient.name} onChange={(e) => updateIngredient(index, "name", e.target.value)} placeholder="材料名" className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /><input value={ingredient.amount} onChange={(e) => updateIngredient(index, "amount", e.target.value)} placeholder="分量" className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /><button type="button" onClick={() => removeIngredient(index)} className="rounded-2xl bg-stone-100 px-4 py-3 text-stone-500 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={18} /></button></div>)}</div>
      </section>
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">作り方</h2><button type="button" onClick={addStep} className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-500 hover:bg-orange-100"><span className="inline-flex items-center gap-1"><Plus size={16} />手順追加</span></button></div>
        <div className="mt-5 grid gap-4">{steps.map((step, index) => <div key={index} className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 font-black text-white">{index + 1}</div><textarea value={step} onChange={(e) => updateStep(index, e.target.value)} placeholder="調理手順を入力" className="min-h-24 flex-1 rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /><button type="button" onClick={() => removeStep(index)} className="h-12 rounded-2xl bg-stone-100 px-4 text-stone-500 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={18} /></button></div>)}</div>
      </section>
      <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"><h2 className="text-xl font-black">タグ・補足</h2><div className="mt-5 grid gap-5"><label className="grid gap-2"><span className="text-sm font-bold">タグ</span><input placeholder="例：時短, 和食, お弁当" className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /></label><label className="grid gap-2"><span className="text-sm font-bold">コツ・ポイント</span><textarea placeholder="おいしく作るためのコツを書いてください" className="min-h-28 rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /></label></div></section>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" className="rounded-full border border-orange-200 px-8 py-3 font-bold text-orange-500 hover:bg-orange-50">プレビュー</button><button type="submit" className="rounded-full bg-orange-500 px-8 py-3 font-bold text-white shadow-sm hover:bg-orange-600">登録する</button></div>
    </form>
  );
}
