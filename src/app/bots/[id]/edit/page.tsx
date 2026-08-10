import Link from "next/link";
import { notFound } from "next/navigation";

import { EditBotForm } from "@/components/bots/edit-bot-form";
import { buttonVariants } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import type { BotFormData } from "@/schemas/bot";

type EditBotPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function isBotStatus(
  value: string,
): value is BotFormData["status"] {
  return value === "公開中" || value === "下書き";
}

export default async function EditBotPage({
  params,
}: EditBotPageProps) {
  const { id } = await params;

  const botId = Number(id);

  if (!Number.isInteger(botId)) {
    notFound();
  }

  const bot = await prisma.bot.findUnique({
    where: {
      id: botId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      systemPrompt: true,
      status: true,
    },
  });

  if (!bot) {
    notFound();
  }

  const status: BotFormData["status"] =
    isBotStatus(bot.status)
      ? bot.status
      : "下書き";

  const initialBot = {
    id: bot.id,
    name: bot.name,
    description: bot.description,
    systemPrompt: bot.systemPrompt,
    status,
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <Link
        href={`/bots/${bot.id}`}
        className={buttonVariants({
          variant: "link",
          className:
            "mb-8 h-auto px-0 text-muted-foreground",
        })}
      >
        Bot詳細へ戻る
      </Link>

      <div className="mb-10">
        <p className="mb-2 text-sm text-muted-foreground">
          Bot ID：{bot.id}
        </p>

        <h1 className="text-3xl font-bold">
          Botを編集
        </h1>

        <p className="mt-2 text-muted-foreground">
          {bot.name}の設定を変更します。
        </p>
      </div>

      <EditBotForm initialBot={initialBot} />
    </main>
  );
}