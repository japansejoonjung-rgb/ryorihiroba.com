import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-orange-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <Link href="/" className="text-2xl font-black text-orange-500">レシピ広場</Link>
          <p className="mt-3 text-sm leading-6 text-stone-500">毎日の料理をもっと楽しく。家庭料理、時短料理、人気レシピを探せるコミュニティです。</p>
        </div>
        <div><h3 className="font-bold">探す</h3><div className="mt-3 grid gap-2 text-sm text-stone-500"><Link href="/recipes">レシピ一覧</Link><Link href="/categories">カテゴリー</Link><Link href="/ranking">ランキング</Link></div></div>
        <div><h3 className="font-bold">参加する</h3><div className="mt-3 grid gap-2 text-sm text-stone-500"><Link href="/post">レシピ投稿</Link><Link href="/login">ログイン</Link><Link href="/login">会員登録</Link></div></div>
        <div><h3 className="font-bold">コンセプト</h3><p className="mt-3 text-sm leading-6 text-stone-500">日本の食卓に合う、あたたかくて使いやすいレシピ体験を目指しています。</p></div>
      </div>
      <div className="border-t border-orange-100 py-4 text-center text-xs text-stone-400">© 2026 レシピ広場. All rights reserved.</div>
    </footer>
  );
}
