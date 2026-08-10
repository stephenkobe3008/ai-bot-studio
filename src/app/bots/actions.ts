"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";

import prisma from "@/lib/prisma";
import {
  botSchema,
  type BotFormData,
} from "@/schemas/bot";

type BotFormErrors = Partial<
  Record<keyof BotFormData, string[]>
>;

type UpdateBotActionResult = {
  success: false;
  message: string;
  fieldErrors?: BotFormErrors;
};

export async function updateBotAction(
  botId: number,
  input: BotFormData,
): Promise<UpdateBotActionResult> {
  if (!Number.isInteger(botId) || botId <= 0) {
    return {
      success: false,
      message: "Bot IDが正しくありません。",
    };
  }

  const result = botSchema.safeParse(input);

  if (!result.success) {
    const flattenedErrors = z.flattenError(result.error);

    return {
      success: false,
      message: "入力内容を確認してください。",
      fieldErrors: flattenedErrors.fieldErrors,
    };
  }

  try {
    await prisma.bot.update({
      where: {
        id: botId,
      },
      data: {
        name: result.data.name,
        description: result.data.description,
        systemPrompt: result.data.systemPrompt,
        status: result.data.status,
      },
    });
  } catch (error) {
    console.error("Botの更新に失敗しました。", error);

    return {
      success: false,
      message: "Botの更新に失敗しました。",
    };
  }

  revalidatePath("/bots");
  revalidatePath(`/bots/${botId}`);
  revalidatePath(`/bots/${botId}/edit`);

  redirect(`/bots/${botId}`);
}