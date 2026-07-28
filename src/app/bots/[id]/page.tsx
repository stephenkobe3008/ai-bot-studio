import Link from "next/link";
import { notFound } from "next/navigation";

import { bots } from "@/data/bots";

type BotDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BotDetailPage({
  params,
}: BotDetailPageProps) {
  const { id } = await params;

  const botId = Number(id);

  const bot = bots.find((bot) => bot.id === botId);

  if (!bot) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <Link
        href="/bots"
        className="mb-8 inline-block text-sm text-gray-600 underline"
      >
        Bot一覧へ戻る
      </Link>

      <article className="rounded-lg border border-gray-200 p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-gray-500">Bot ID：{bot.id}</p>

            <h1 className="text-3xl font-bold">{bot.name}</h1>
          </div>

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

        <section className="mb-8">
          <h2 className="mb-2 font-semibold">説明</h2>
          <p className="text-gray-600">{bot.description}</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 font-semibold">システムプロンプト</h2>

          <p className="rounded-md bg-gray-50 p-4 text-gray-700">
            {bot.systemPrompt}
          </p>
        </section>

        <div className="flex gap-3">
          <button className="rounded-md bg-black px-4 py-2 text-white">
            編集する
          </button>

          <button className="rounded-md border border-red-300 px-4 py-2 text-red-600">
            削除する
          </button>
        </div>
      </article>
    </main>
  );
}