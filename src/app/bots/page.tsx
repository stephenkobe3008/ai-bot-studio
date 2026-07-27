import Link from "next/link";

type Bot = {
  id: number;
  name: string;
  description: string;
  status: "公開中" | "下書き";
};

const bots: Bot[] = [
  {
    id: 1,
    name: "カスタマーサポートBot",
    description: "お客様からの質問に回答するAI Botです。",
    status: "公開中",
  },
  {
    id: 2,
    name: "社内質問Bot",
    description: "社内ルールや業務手順について回答します。",
    status: "下書き",
  },
  {
    id: 3,
    name: "採用案内Bot",
    description: "求人や採用情報について回答します。",
    status: "公開中",
  },
];

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

        <button className="rounded-md bg-black px-4 py-2 text-white">
          Botを作成
        </button>
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

            <button className="mt-6 rounded-md border border-gray-300 px-4 py-2">
              詳細を見る
            </button>
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