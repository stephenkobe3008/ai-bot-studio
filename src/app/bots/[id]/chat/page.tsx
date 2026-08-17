import Link from "next/link";
import { notFound } from "next/navigation";

import {
  BotChat,
  type ChatMessage,
} from "@/components/bots/bot-chat";
import { buttonVariants } from "@/components/ui/button";
import prisma from "@/lib/prisma";

type BotChatPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    conversationId?:
      | string
      | string[];
  }>;
};

export default async function BotChatPage({
  params,
  searchParams,
}: BotChatPageProps) {
  const { id } = await params;

  const query =
    await searchParams;

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

  const rawConversationId =
    Array.isArray(
      query.conversationId,
    )
      ? query.conversationId[0]
      : query.conversationId;

  let conversationId:
    | number
    | null = null;

  if (rawConversationId) {
    const parsedConversationId =
      Number(rawConversationId);

    if (
      !Number.isInteger(
        parsedConversationId,
      ) ||
      parsedConversationId <= 0
    ) {
      notFound();
    }

    conversationId =
      parsedConversationId;
  }

  const conversations =
    await prisma.conversation.findMany({
      where: {
        botId: bot.id,
      },

      orderBy: {
        updatedAt: "desc",
      },

      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    });

  let initialMessages:
    ChatMessage[] = [];

  if (conversationId) {
    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          botId: bot.id,
        },

        select: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },

            select: {
              id: true,
              role: true,
              content: true,
            },
          },
        },
      });

    if (!conversation) {
      notFound();
    }

    initialMessages =
      conversation.messages.map(
        (message) => ({
          id:
            String(message.id),

          role:
            message.role ===
            "assistant"
              ? "assistant"
              : "user",

          content:
            message.content,
        }),
      );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
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
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4">
            <Link
              href={`/bots/${bot.id}/chat`}
              className={buttonVariants({
                variant: "default",
                className: "w-full",
              })}
            >
              ＋ 新しい会話
            </Link>

            <div className="space-y-2">
              <p className="text-sm font-semibold">
                会話履歴
              </p>

              {conversations.length ===
              0 ? (
                <p className="text-sm text-muted-foreground">
                  まだ会話履歴はありません。
                </p>
              ) : (
                conversations.map(
                  (conversation) => (
                    <Link
                      key={
                        conversation.id
                      }
                      href={`/bots/${bot.id}/chat?conversationId=${conversation.id}`}
                      className={
                        conversation.id ===
                        conversationId
                          ? "block rounded-md bg-muted p-3"
                          : "block rounded-md border p-3 transition hover:bg-muted"
                      }
                    >
                      <p className="truncate text-sm font-medium">
                        {
                          conversation.title
                        }
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {conversation.updatedAt.toLocaleString(
                          "ja-JP",
                        )}
                      </p>
                    </Link>
                  ),
                )
              )}
            </div>
          </aside>

          <BotChat
            key={
              conversationId ??
              "new"
            }
            botId={bot.id}
            botName={bot.name}
            initialConversationId={
              conversationId ??
              undefined
            }
            initialMessages={
              initialMessages
            }
          />
        </div>
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