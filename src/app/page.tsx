import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">AI Bot Studio</h1>

      <p className="text-gray-600">
        自分専用のAI Botを作成・管理するアプリ
      </p>

      <Link
        href="/bots"
        className="rounded-md bg-black px-6 py-3 text-white transition hover:bg-gray-700"
      >
        Bot一覧を見る
      </Link>
    </main>
  );
}