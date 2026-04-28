"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { CircleUserRound, Coins, Globe2, Home, ListPlus, LogOut, Search, Menu, Trophy, Utensils, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Language, useLanguage } from "@/context/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { logoutUser } from "@/lib/authService";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { language, setLanguage, t } = useLanguage();
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
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
    { label: t.recommended, href: "/" },
    { label: t.categories, href: "/categories" },
    { label: t.ranking, href: "/ranking" },
    { label: t.column, href: "/" },
    { label: t.post, href: "/post" },
    { label: t.mypage, href: "/mypage" },
  ];

  const languageItems: { label: string; value: Language }[] = [
    { label: "日本語", value: "ja" },
    { label: "한국어", value: "ko" },
    { label: "English", value: "en" },
  ];

  const mobileTabs = [
    { label: t.recommended, href: "/", icon: Home },
    { label: t.categories, href: "/categories", icon: Utensils },
    { label: t.ranking, href: "/ranking", icon: Trophy },
    { label: t.post, href: "/post", icon: ListPlus },
    { label: t.mypage, href: user ? "/mypage" : "/login", icon: CircleUserRound },
  ];

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="max-w-[52vw] truncate text-xl font-black tracking-tight text-orange-500 sm:text-2xl">{t.brand}</Link>
        <form onSubmit={handleSearch} className="hidden flex-1 items-center rounded-full border border-orange-100 bg-orange-50 px-4 py-2 md:flex">
          <Search size={18} className="text-orange-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t.searchPlaceholder} className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-stone-400" />
        </form>
        <nav className="hidden items-center gap-5 text-sm font-medium text-stone-700 lg:flex">
          {navItems.map((item) => <Link key={item.label} href={item.href} className="hover:text-orange-500">{item.label}</Link>)}
        </nav>
        <div className="relative hidden md:block">
          <button type="button" onClick={() => setLanguageOpen((value) => !value)} className="tap-target rounded-full border border-orange-100 p-2 text-stone-600 hover:bg-orange-50" aria-label="language">
            <Globe2 size={20} />
          </button>
          {languageOpen && (
            <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-lg">
              {languageItems.map((item) => (
                <button key={item.value} type="button" onClick={() => { setLanguage(item.value); setLanguageOpen(false); }} className={`block w-full px-4 py-3 text-left text-sm font-bold ${language === item.value ? "bg-orange-50 text-orange-500" : "text-stone-600 hover:bg-orange-50"}`}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 hover:bg-orange-50">{t.login}</Link>
                <Link href="/login" className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600">{t.signup}</Link>
              </>
            )}
          </div>
        )}
        <button onClick={() => setOpen((prev) => !prev)} className="tap-target rounded-full border border-orange-100 p-2 md:hidden" aria-label="menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-orange-100 bg-white px-4 py-4 shadow-lg md:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex items-center rounded-full border border-orange-100 bg-orange-50 px-4 py-2">
            <Search size={18} className="text-orange-400" />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t.searchPlaceholder} className="ml-2 w-full bg-transparent text-sm outline-none" />
          </form>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {languageItems.map((item) => (
              <button key={item.value} type="button" onClick={() => setLanguage(item.value)} className={`rounded-full px-3 py-2 text-xs font-bold ${language === item.value ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-500"}`}>
                {item.label}
              </button>
            ))}
          </div>
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
                    {t.logout}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setOpen(false)} className="rounded-full border border-orange-200 px-4 py-3 text-center text-sm font-bold text-orange-500">{t.login}</Link>
                  <Link href="/login" onClick={() => setOpen(false)} className="rounded-full bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white">{t.signup}</Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-orange-100 bg-white/95 shadow-[0_-8px_20px_rgba(120,80,40,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5 px-1 pt-1">
        {mobileTabs.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-bold ${active ? "text-orange-500" : "text-stone-500"}`}>
              <Icon size={21} strokeWidth={active ? 2.6 : 2} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
