"use client";

import type { SubmitEvent } from "react";
import {
  useState,
  useTransition,
} from "react";
import * as z from "zod";

import { updateBotAction } from "@/app/bots/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  botSchema,
  type BotFormData,
} from "@/schemas/bot";

type InitialBot = {
  id: number;
  name: string;
  description: string;
  systemPrompt: string;
  status: BotFormData["status"];
};

type EditBotFormProps = {
  initialBot: InitialBot;
};

type BotFormErrors = Partial<
  Record<keyof BotFormData, string[]>
>;

export function EditBotForm({
  initialBot,
}: EditBotFormProps) {
  const [name, setName] = useState(
    initialBot.name,
  );

  const [description, setDescription] =
    useState(initialBot.description);

  const [systemPrompt, setSystemPrompt] =
    useState(initialBot.systemPrompt);

  const [status, setStatus] =
    useState<BotFormData["status"]>(
      initialBot.status,
    );

  const [errors, setErrors] =
    useState<BotFormErrors>({});

  const [serverError, setServerError] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const handleSubmit = (
    event: SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setServerError(null);

    const result = botSchema.safeParse({
      name,
      description,
      systemPrompt,
      status,
    });

    if (!result.success) {
      const flattenedErrors =
        z.flattenError(result.error);

      setErrors(
        flattenedErrors.fieldErrors,
      );

      return;
    }

    setErrors({});

    startTransition(async () => {
      const actionResult =
        await updateBotAction(
          initialBot.id,
          result.data,
        );

      if (!actionResult.success) {
        if (actionResult.fieldErrors) {
          setErrors(
            actionResult.fieldErrors,
          );
        }

        setServerError(
          actionResult.message,
        );
      }
    });
  };

  const handleReset = () => {
    setName(initialBot.name);
    setDescription(initialBot.description);
    setSystemPrompt(
      initialBot.systemPrompt,
    );
    setStatus(initialBot.status);

    setErrors({});
    setServerError(null);
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>
          編集フォーム
        </CardTitle>

        <CardDescription>
          データベースに保存されている
          Bot情報を編集します。
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          noValidate
          onSubmit={handleSubmit}
        >
          <FieldGroup>
            <Field
              data-invalid={
                errors.name
                  ? true
                  : undefined
              }
            >
              <FieldLabel htmlFor="name">
                Bot名
              </FieldLabel>

              <Input
                id="name"
                type="text"
                value={name}
                disabled={isPending}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="例：カスタマーサポートBot"
                aria-invalid={Boolean(
                  errors.name,
                )}
                aria-describedby={
                  errors.name
                    ? "edit-name-error"
                    : undefined
                }
              />

              {errors.name?.[0] && (
                <FieldError id="edit-name-error">
                  {errors.name[0]}
                </FieldError>
              )}
            </Field>

            <Field
              data-invalid={
                errors.description
                  ? true
                  : undefined
              }
            >
              <FieldLabel htmlFor="description">
                説明
              </FieldLabel>

              <Textarea
                id="description"
                value={description}
                disabled={isPending}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="このBotが何をするのか入力してください"
                rows={4}
                aria-invalid={Boolean(
                  errors.description,
                )}
                aria-describedby={
                  errors.description
                    ? "edit-description-error"
                    : undefined
                }
              />

              {errors.description?.[0] && (
                <FieldError id="edit-description-error">
                  {errors.description[0]}
                </FieldError>
              )}
            </Field>

            <Field
              data-invalid={
                errors.systemPrompt
                  ? true
                  : undefined
              }
            >
              <FieldLabel htmlFor="systemPrompt">
                システムプロンプト
              </FieldLabel>

              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                disabled={isPending}
                onChange={(event) =>
                  setSystemPrompt(
                    event.target.value,
                  )
                }
                placeholder="例：あなたは丁寧なサポート担当です"
                rows={6}
                aria-invalid={Boolean(
                  errors.systemPrompt,
                )}
                aria-describedby={
                  errors.systemPrompt
                    ? "edit-system-prompt-error"
                    : undefined
                }
              />

              {errors.systemPrompt?.[0] && (
                <FieldError id="edit-system-prompt-error">
                  {errors.systemPrompt[0]}
                </FieldError>
              )}
            </Field>

            <Field
              data-invalid={
                errors.status
                  ? true
                  : undefined
              }
            >
              <FieldLabel htmlFor="status">
                ステータス
              </FieldLabel>

              <Select
                value={status}
                disabled={isPending}
                onValueChange={(value) => {
                  if (
                    value === "公開中" ||
                    value === "下書き"
                  ) {
                    setStatus(value);
                  }
                }}
              >
                <SelectTrigger
                  id="status"
                  className="w-full"
                  aria-invalid={Boolean(
                    errors.status,
                  )}
                  aria-describedby={
                    errors.status
                      ? "edit-status-error"
                      : undefined
                  }
                >
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="下書き">
                    下書き
                  </SelectItem>

                  <SelectItem value="公開中">
                    公開中
                  </SelectItem>
                </SelectContent>
              </Select>

              {errors.status?.[0] && (
                <FieldError id="edit-status-error">
                  {errors.status[0]}
                </FieldError>
              )}
            </Field>

            {serverError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {serverError}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending
                  ? "保存中..."
                  : "変更を保存"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={handleReset}
              >
                DBの内容に戻す
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}