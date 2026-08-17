import OpenAI from "openai";

import prisma from "@/lib/prisma";
import { chatRequestSchema } from "@/schemas/chat";

export const runtime = "nodejs";

export async function POST(
  request: Request,
) {
  const apiKey = process.env.OPENAI_API_KEY;

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

  const openai = new OpenAI({
    apiKey,
  });

  try {
    const response =
      await openai.responses.create({
        model:
          process.env.OPENAI_MODEL ??
          "gpt-5.6-luna",

        instructions:
          bot.systemPrompt,

        input:
          result.data.message,
      });

    const reply =
      response.output_text.trim();

    if (!reply) {
      return Response.json(
        {
          error:
            "AIから回答を取得できませんでした。",
        },
        {
          status: 502,
        },
      );
    }

    return Response.json({
      reply,
    });
  } catch (error) {
    console.error(
      "OpenAI APIの呼び出しに失敗しました。",
      error,
    );

    return Response.json(
      {
        error:
          "AIからの回答取得に失敗しました。",
      },
      {
        status: 500,
      },
    );
  }
}