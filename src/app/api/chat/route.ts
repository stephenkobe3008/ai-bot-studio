import OpenAI from "openai";

import prisma from "@/lib/prisma";
import { chatRequestSchema } from "@/schemas/chat";

export const runtime = "nodejs";

type ConversationMessage = {
  role: string;
  content: string;
};

function createConversationTitle(
  message: string,
) {
  const trimmedMessage = message.trim();

  if (trimmedMessage.length <= 30) {
    return trimmedMessage;
  }

  return `${trimmedMessage.slice(0, 30)}...`;
}

function convertMessagesForOpenAI(
  messages: ConversationMessage[],
) {
  return messages.map((message) => ({
    role:
      message.role === "assistant"
        ? ("assistant" as const)
        : ("user" as const),

    content: message.content,
  }));
}

export async function POST(
  request: Request,
) {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          "OPENAI_API_KEYが設定されていません。",
      },
      {
        status: 500,
      },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        error:
          "リクエストの形式が正しくありません。",
      },
      {
        status: 400,
      },
    );
  }

  const result =
    chatRequestSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      {
        error:
          "入力内容を確認してください。",
      },
      {
        status: 400,
      },
    );
  }

  const bot =
    await prisma.bot.findUnique({
      where: {
        id: result.data.botId,
      },

      select: {
        id: true,
        name: true,
        systemPrompt: true,
        status: true,
      },
    });

  if (!bot) {
    return Response.json(
      {
        error:
          "指定されたBotが見つかりません。",
      },
      {
        status: 404,
      },
    );
  }

  if (bot.status !== "公開中") {
    return Response.json(
      {
        error:
          "このBotは現在公開されていません。",
      },
      {
        status: 403,
      },
    );
  }

  let conversation:
    | {
        id: number;
        messages: ConversationMessage[];
      }
    | null = null;

  if (result.data.conversationId) {
    conversation =
      await prisma.conversation.findFirst({
        where: {
          id: result.data.conversationId,
          botId: bot.id,
        },

        select: {
          id: true,

          messages: {
            orderBy: {
              createdAt: "asc",
            },

            select: {
              role: true,
              content: true,
            },
          },
        },
      });

    if (!conversation) {
      return Response.json(
        {
          error:
            "指定された会話が見つかりません。",
        },
        {
          status: 404,
        },
      );
    }
  }

  const previousMessages =
    conversation?.messages ?? [];

  const input = [
    ...convertMessagesForOpenAI(
      previousMessages,
    ),

    {
      role: "user" as const,
      content: result.data.message,
    },
  ];

  let conversationId: number;

  if (conversation) {
    conversationId =
      conversation.id;

    await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content:
          result.data.message,
      },
    });
  } else {
    const newConversation =
      await prisma.conversation.create({
        data: {
          botId: bot.id,

          title:
            createConversationTitle(
              result.data.message,
            ),

          messages: {
            create: {
              role: "user",
              content:
                result.data.message,
            },
          },
        },

        select: {
          id: true,
        },
      });

    conversationId =
      newConversation.id;
  }

  const saveAssistantMessage =
    async (content: string) => {
      await prisma.$transaction([
        prisma.message.create({
          data: {
            conversationId,
            role: "assistant",
            content,
          },
        }),

        prisma.conversation.update({
          where: {
            id: conversationId,
          },

          data: {
            updatedAt: new Date(),
          },
        }),
      ]);
    };

  const openai = new OpenAI({
    apiKey,
  });

  const encoder = new TextEncoder();

  const responseStream =
    new ReadableStream({
      async start(controller) {
        const sendEvent = (
          data: unknown,
        ) => {
          if (request.signal.aborted) {
            return;
          }

          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify(
                  data,
                )}\n\n`,
              ),
            );
          } catch {
            // クライアント側で通信が切断された場合は
            // それ以上イベントを送信しない
          }
        };

        let reply = "";
        let assistantSaved = false;

        try {
          sendEvent({
            type: "conversation",
            conversationId,
          });

          const stream =
            await openai.responses.create(
              {
                model:
                  process.env
                    .OPENAI_MODEL ??
                  "gpt-5.6",

                instructions:
                  bot.systemPrompt,

                input,

                stream: true,
              },
              {
                signal: request.signal,
              },
            );

          for await (const event of stream) {
            if (
              event.type ===
              "response.output_text.delta"
            ) {
              reply += event.delta;

              sendEvent({
                type: "delta",
                delta: event.delta,
              });
            }
          }

          const finalReply =
            reply.trim();

          if (!finalReply) {
            throw new Error(
              "AIから回答を取得できませんでした。",
            );
          }

          await saveAssistantMessage(
            finalReply,
          );

          assistantSaved = true;

          sendEvent({
            type: "done",
          });
        } catch (error) {
          if (request.signal.aborted) {
            const partialReply =
              reply.trim();

            if (
              partialReply &&
              !assistantSaved
            ) {
              try {
                await saveAssistantMessage(
                  partialReply,
                );

                assistantSaved = true;
              } catch (saveError) {
                console.error(
                  "停止したAI回答の保存に失敗しました。",
                  saveError,
                );
              }
            }

            console.log(
              "AI回答のストリーミングを停止しました。",
            );

            return;
          }

          console.error(
            "OpenAI APIのストリーミングに失敗しました。",
            error,
          );

          sendEvent({
            type: "error",
            message:
              "AIからの回答取得に失敗しました。",
          });
        } finally {
          if (!request.signal.aborted) {
            try {
              controller.close();
            } catch {
              // すでにストリームが閉じている場合は何もしない
            }
          }
        }
      },
    });

  return new Response(responseStream, {
    headers: {
      "Content-Type":
        "text/event-stream; charset=utf-8",

      "Cache-Control":
        "no-cache, no-transform",
    },
  });
}