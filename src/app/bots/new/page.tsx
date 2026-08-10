"use client";

import Link from "next/link";
import type { SubmitEvent } from "react";
import {
  useState,
  useTransition,
} from "react";
import * as z from "zod";

import { createBotAction } from "@/app/bots/actions";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
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

type BotFormErrors = Partial<
  Record<keyof BotFormData, string[]>
>;

export default function NewBotPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const [status, setStatus] =
    useState<BotFormData["status"]>("下書き");

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

      setErrors(flattenedErrors.fieldErrors);

      return;
    }

    setErrors({});

    startTransition(async () => {
      const actionResult =
        await createBotAction(result.data);

      if (!actionResult.success) {
        if (actionResult.fieldErrors) {
          setErrors(actionResult.fieldErrors);
        }

        setServerError(actionResult.message);
      }
    });
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setSystemPrompt("");
    setStatus("下書き");

    setErrors({});
    setServerError(null);
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <Link
        href="/bots"
        className={buttonVariants({
          variant: "link",
          className:
            "mb-8 h-auto px-0 text-muted-foreground",
        })}
      >
        Bot一覧へ戻る
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          Botを新規作成
        </h1>

        <p className="mt-2 text-muted-foreground">
          Botの基本情報と役割を入力してください。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Bot情報
          </CardTitle>

          <CardDescription>
            入力した内容はデータベースへ保存されます。
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
                    setName(event.target.value)
                  }
                  placeholder="例：学習サポートBot"
                  aria-invalid={Boolean(
                    errors.name,
                  )}
                  aria-describedby={
                    errors.name
                      ? "create-name-error"
                      : undefined
                  }
                />

                {errors.name?.[0] && (
                  <FieldError id="create-name-error">
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
                      ? "create-description-error"
                      : undefined
                  }
                />

                {errors.description?.[0] && (
                  <FieldError id="create-description-error">
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
                  placeholder="例：あなたは初心者向けのプログラミング講師です"
                  rows={6}
                  aria-invalid={Boolean(
                    errors.systemPrompt,
                  )}
                  aria-describedby={
                    errors.systemPrompt
                      ? "create-system-prompt-error"
                      : undefined
                  }
                />

                {errors.systemPrompt?.[0] && (
                  <FieldError id="create-system-prompt-error">
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
                        ? "create-status-error"
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
                  <FieldError id="create-status-error">
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
                    ? "作成中..."
                    : "Botを作成"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={handleReset}
                >
                  入力をリセット
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}