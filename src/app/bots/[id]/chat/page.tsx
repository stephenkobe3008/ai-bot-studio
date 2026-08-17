import Link from "next/link";
import { notFound } from "next/navigation";

import { BotChat } from "@/components/bots/bot-chat";
import { buttonVariants } from "@/components/ui/button";
import prisma from "@/lib/prisma";

type BotChatPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BotChatPage({
  params,
}: BotChatPageProps) {
  const { id } = await params;

  const botId = Number(id);

  if (
    !Number.isInteger(botId) ||
    botId <= 0
  ) {
    notFound();
  }

  const bot =
    await prisma.bot.findUnique({
      where: {
        id: botId,
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

  if (!bot) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-12">
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
          AIチャット
        </h1>

        <p className="mt-2 text-muted-foreground">
          {bot.name}と会話します。
        </p>
      </div>

      {bot.status === "公開中" ? (
        <BotChat
          botId={bot.id}
          botName={bot.name}
        />
      ) : (
        <div className="rounded-lg border p-8 text-center">
          <p className="font-semibold">
            このBotは下書き状態です。
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Botを公開中に変更すると
            チャットできます。
          </p>
        </div>
      )}
    </main>
  );
}