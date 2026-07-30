import * as z from "zod";

export const botSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      error: "Bot名は2文字以上で入力してください。",
    })
    .max(50, {
      error: "Bot名は50文字以内で入力してください。",
    }),

  description: z
    .string()
    .trim()
    .min(10, {
      error: "説明は10文字以上で入力してください。",
    })
    .max(200, {
      error: "説明は200文字以内で入力してください。",
    }),

  systemPrompt: z
    .string()
    .trim()
    .min(10, {
      error: "システムプロンプトは10文字以上で入力してください。",
    })
    .max(500, {
      error: "システムプロンプトは500文字以内で入力してください。",
    }),

  status: z.enum(["公開中", "下書き"]),
});

export type BotFormData = z.infer<typeof botSchema>;