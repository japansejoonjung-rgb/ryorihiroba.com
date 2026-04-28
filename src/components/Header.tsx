"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleUserRound, Coins, LogOut, Search, Menu, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { logoutUser } from "@/lib/authService";

export default function Header() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(keyword.trim() ? `/recipes?query=${encodeURIComponent(keyword.trim())}` : "/recipes");
    setOpen(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      setOpen(false);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const navItems = [
    { label: "おすすめ", href: "/" },
    { label: "カテゴリー", href: "/categories" },
    { label: "ランキング", href: "/ranking" },
    { label: "コラム", href: "/" },
    { label: "レシピ投稿", href: "/post" },
    { label: "マイページ", href: "/mypage" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-2xl font-black tracking-tight text-orange-500">レシピ広場</Link>
        <form onSubmit={handleSearch} className="hidden flex-1 items-center rounded-full border border-orange-100 bg-orange-50 px-4 py-2 md:flex">
          <Search size={18} className="text-orange-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="料理名・食材で検索" className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-stone-400" />
        </form>
        <nav className="hidden items-center gap-5 text-sm font-medium text-stone-700 lg:flex">
          {navItems.map((item) => <Link key={item.label} href={item.href} className="hover:text-orange-500">{item.label}</Link>)}
        </nav>
        {!loading && (
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link href="/mypage" className="inline-flex max-w-44 items-center gap-2 truncate rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                  <CircleUserRound size={18} className="shrink-0" />
                  <span className="truncate">{user.displayName || user.email}</span>
                </Link>
                <Link href="/mypage" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
                  <Coins size={16} />
                  {profile?.points ?? 0}P
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center gap-1 rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 hover:bg-orange-50 disabled:cursor-not-allowed disabled:text-stone-400"
                >
                  <LogOut size={16} />
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 hover:bg-orange-50">ログイン</Link>
                <Link href="/login" className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600">会員登録</Link>
              </>
            )}
          </div>
        )}
        <button onClick={() => setOpen((prev) => !prev)} className="rounded-full border border-orange-100 p-2 md:hidden" aria-label="menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-orange-100 bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex items-center rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
            <Search size={18} className="text-orange-400" />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="料理名・食材で検索" className="ml-2 w-full bg-transparent text-sm outline-none" />
          </form>
          <nav className="grid gap-3 text-sm font-semibold">
            {navItems.map((item) => <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 hover:bg-orange-50">{item.label}</Link>)}
          </nav>
          {!loading && (
            <div className="mt-4 grid gap-2 border-t border-orange-100 pt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-3 py-3 text-sm font-semibold text-orange-600">
                    <CircleUserRound size={18} />
                    <span className="truncate">{user.displayName || user.email}</span>
                  </div>
                  <Link href="/mypage" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-full bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
                    <Coins size={16} />
                    {profile?.points ?? 0}P
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-orange-200 px-4 py-3 text-sm font-bold text-orange-500 disabled:cursor-not-allowed disabled:text-stone-400"
                  >
                    <LogOut size={16} />
                    ログアウト
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-orange-200 px-4 py-3 text-center text-sm font-bold text-orange-500">ログイン</Link>
                  <Link href="/login" onClick={() => setOpen(false)} className="rounded-full bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white">会員登録</Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
