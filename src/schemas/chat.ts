import * as z from "zod";

export const chatRequestSchema = z.object({
  botId: z
    .number()
    .int()
    .positive(),

  message: z
    .string()
    .trim()
    .min(1, {
      error: "メッセージを入力してください。",
    })
    .max(2000, {
      error: "メッセージは2000文字以内で入力してください。",
    }),
});

export type ChatRequest = z.infer<
  typeof chatRequestSchema
>;