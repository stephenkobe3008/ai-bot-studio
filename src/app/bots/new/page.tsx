"use client";

import type { SubmitEvent } from "react";
import { useState } from "react";
import Link from "next/link";

type BotStatus = "公開中" | "下書き";

type SubmittedBot = {
  name: string;
  description: string;
  systemPrompt: string;
  status: BotStatus;
};

export default function NewBotPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [status, setStatus] = useState<BotStatus>("下書き");
  const [submittedBot, setSubmittedBot] =
    useState<SubmittedBot | null>(null);

    const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

    const newBot: SubmittedBot = {
      name,
      description,
      systemPrompt,
      status,
    };

    setSubmittedBot(newBot);
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setSystemPrompt("");
    setStatus("下書き");
    setSubmittedBot(null);
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <Link
        href="/bots"
        className="mb-8 inline-block text-sm text-gray-600 underline"
      >
        Bot一覧へ戻る
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold">Botを新規作成</h1>

        <p className="mt-2 text-gray-600">
          Botの基本情報と役割を入力してください。
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-gray-200 p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block font-semibold"
            >
              Bot名
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例：カスタマーサポートBot"
              required
              minLength={2}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block font-semibold"
            >
              説明
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="このBotが何をするのか入力してください"
              required
              rows={4}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
            />
          </div>

          <div>
            <label
              htmlFor="systemPrompt"
              className="mb-2 block font-semibold"
            >
              システムプロンプト
            </label>

            <textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(event) =>
                setSystemPrompt(event.target.value)
              }
              placeholder="例：あなたは丁寧なカスタマーサポート担当です"
              required
              rows={6}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block font-semibold"
            >
              ステータス
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as BotStatus)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black"
            >
              <option value="下書き">下書き</option>
              <option value="公開中">公開中</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-md bg-black px-5 py-2 text-white transition hover:bg-gray-700"
            >
              作成内容を確認
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-gray-300 px-5 py-2"
            >
              入力をリセット
            </button>
          </div>
        </form>

        <section className="rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold">作成内容</h2>

          {submittedBot ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500">Bot名</p>
                <p className="font-semibold">{submittedBot.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">説明</p>
                <p>{submittedBot.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  システムプロンプト
                </p>

                <p className="rounded-md bg-gray-50 p-4 text-gray-700">
                  {submittedBot.systemPrompt}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">ステータス</p>
                <p>{submittedBot.status}</p>
              </div>

              <p className="rounded-md bg-green-50 p-4 text-sm text-green-700">
                入力内容をReactのstateから取得できました。
                データベースへの保存は後の課題で実装します。
              </p>
            </div>
          ) : (
            <p className="text-gray-500">
              フォームを入力して「作成内容を確認」を押すと、
              ここに内容が表示されます。
            </p>
          )}
        </section>
      </div>
    </main>
  );
}