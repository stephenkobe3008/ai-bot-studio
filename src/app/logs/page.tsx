import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BotLogsPage() {
  const [
    botCount,
    conversationCount,
    messageCount,
    recentConversations,
  ] = await Promise.all([
    prisma.bot.count(),

    prisma.conversation.count(),

    prisma.message.count(),

    prisma.conversation.findMany({
      take: 20,

      orderBy: {
        updatedAt: "desc",
      },

      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,

        bot: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },

        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            AI Bot Studio
          </p>

          <h1 className="text-3xl font-bold">
            Bot Log
          </h1>

          <p className="mt-2 text-muted-foreground">
            Botの利用状況と最近の会話を確認します。
          </p>
        </div>

        <Link
          href="/bots"
          className={buttonVariants({
            variant: "outline",
          })}
        >
          Bot一覧へ
        </Link>
      </div>

      <section className="mb-10 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>
              Bot数
            </CardDescription>

            <CardTitle className="text-4xl">
              {botCount}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              データベースに登録されているBot
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>
              会話数
            </CardDescription>

            <CardTitle className="text-4xl">
              {conversationCount}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              作成されたConversation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>
              メッセージ数
            </CardDescription>

            <CardTitle className="text-4xl">
              {messageCount}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              user / assistantを含む総Message数
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-2xl font-bold">
            最近の会話
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            更新日時が新しい順に最大20件表示します。
          </p>
        </div>

        {recentConversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="font-medium">
                まだ会話履歴がありません。
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                公開中のBotとチャットすると
                ここに会話が表示されます。
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {recentConversations.map(
              (conversation) => (
                <Card key={conversation.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-lg">
                            {conversation.title}
                          </CardTitle>

                          <Badge
                            variant={
                              conversation.bot.status ===
                              "公開中"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              conversation.bot.status ===
                              "公開中"
                                ? "bg-green-600 text-white"
                                : undefined
                            }
                          >
                            {
                              conversation.bot
                                .status
                            }
                          </Badge>
                        </div>

                        <CardDescription>
                          {
                            conversation.bot
                              .name
                          }
                          {" / "}
                          Conversation ID：
                          {conversation.id}
                        </CardDescription>
                      </div>

                      <Link
                        href={`/bots/${conversation.bot.id}/chat?conversationId=${conversation.id}`}
                        className={buttonVariants({
                          variant: "outline",
                        })}
                      >
                        会話を見る
                      </Link>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid gap-4 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground">
                          メッセージ数
                        </p>

                        <p className="mt-1 font-semibold">
                          {
                            conversation._count
                              .messages
                          }
                          件
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">
                          作成日時
                        </p>

                        <p className="mt-1 font-semibold">
                          {conversation.createdAt.toLocaleString(
                            "ja-JP",
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">
                          最終更新
                        </p>

                        <p className="mt-1 font-semibold">
                          {conversation.updatedAt.toLocaleString(
                            "ja-JP",
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}