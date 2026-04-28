"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Language = "ja" | "ko" | "en";

const labels = {
  ja: {
    brand: "レシピ広場",
    recommended: "おすすめ",
    categories: "カテゴリー",
    ranking: "ランキング",
    column: "コラム",
    post: "レシピ投稿",
    mypage: "マイページ",
    searchPlaceholder: "料理名・食材で検索",
    login: "ログイン",
    signup: "会員登録",
    logout: "ログアウト",
  },
  ko: {
    brand: "요리히로바",
    recommended: "추천",
    categories: "카테고리",
    ranking: "랭킹",
    column: "칼럼",
    post: "레시피 등록",
    mypage: "마이페이지",
    searchPlaceholder: "요리명・재료 검색",
    login: "로그인",
    signup: "회원가입",
    logout: "로그아웃",
  },
  en: {
    brand: "Recipe Hiroba",
    recommended: "Home",
    categories: "Categories",
    ranking: "Ranking",
    column: "Columns",
    post: "Post Recipe",
    mypage: "My Page",
    searchPlaceholder: "Search recipes or ingredients",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof labels.ja;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "ja",
  setLanguage: () => undefined,
  t: labels.ja,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ja");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("recipe-hiroba-language");
    if (savedLanguage === "ko" || savedLanguage === "en" || savedLanguage === "ja") {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem("recipe-hiroba-language", nextLanguage);
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: labels[language],
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
