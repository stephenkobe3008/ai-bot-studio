import Link from "next/link";

import { bots } from "@/data/bots";

export default function BotsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bot一覧</h1>

          <p className="mt-2 text-gray-600">
            作成したAI Botを管理します。
          </p>
        </div>
                  <Link
            href="/bots/new"
            className="rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-700"
          >
        Botを作成
      </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {bots.map((bot) => (
          <article
            key={bot.id}
            className="rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">{bot.name}</h2>

              <span
                className={
                  bot.status === "公開中"
                    ? "rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
                    : "rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                }
              >
                {bot.status}
              </span>
            </div>

            <p className="text-gray-600">{bot.description}</p>

            <Link
              href={`/bots/${bot.id}`}
              className="mt-6 inline-block rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              詳細を見る
            </Link>
          </article>
        ))}
      </div>

      <Link
        href="/"
        className="mt-10 inline-block text-sm text-gray-600 underline"
      >
        トップページへ戻る
      </Link>
    </main>
  );
}