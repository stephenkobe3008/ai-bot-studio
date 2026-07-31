"use client";

import Link from "next/link";
import type { SubmitEvent } from "react";
import { useState } from "react";
import * as z from "zod";

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

  const [submittedBot, setSubmittedBot] =
    useState<BotFormData | null>(null);

  const [errors, setErrors] =
    useState<BotFormErrors>({});

  const handleSubmit = (
    event: SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const result = botSchema.safeParse({
      name,
      description,
      systemPrompt,
      status,
    });

    if (!result.success) {
      const flattenedErrors = z.flattenError(result.error);

      setErrors(flattenedErrors.fieldErrors);
      setSubmittedBot(null);

      return;
    }

    setErrors({});

    setName(result.data.name);
    setDescription(result.data.description);
    setSystemPrompt(result.data.systemPrompt);
    setStatus(result.data.status);

    setSubmittedBot(result.data);
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setSystemPrompt("");
    setStatus("下書き");
    setSubmittedBot(null);
    setErrors({});
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
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

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bot情報</CardTitle>

            <CardDescription>
              Bot名、説明、システムプロンプトを
              入力してください。
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
                    errors.name ? true : undefined
                  }
                >
                  <FieldLabel htmlFor="name">
                    Bot名
                  </FieldLabel>

                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="例：カスタマーサポートBot"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name
                        ? "name-error"
                        : undefined
                    }
                  />

                  {errors.name?.[0] && (
                    <FieldError id="name-error">
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
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="このBotが何をするのか入力してください"
                    rows={4}
                    aria-invalid={Boolean(
                      errors.description,
                    )}
                    aria-describedby={
                      errors.description
                        ? "description-error"
                        : undefined
                    }
                  />

                  {errors.description?.[0] && (
                    <FieldError id="description-error">
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
                    onChange={(event) =>
                      setSystemPrompt(
                        event.target.value,
                      )
                    }
                    placeholder="例：あなたは丁寧なカスタマーサポート担当です"
                    rows={6}
                    aria-invalid={Boolean(
                      errors.systemPrompt,
                    )}
                    aria-describedby={
                      errors.systemPrompt
                        ? "system-prompt-error"
                        : undefined
                    }
                  />

                  {errors.systemPrompt?.[0] && (
                    <FieldError id="system-prompt-error">
                      {errors.systemPrompt[0]}
                    </FieldError>
                  )}
                </Field>

                <Field
                  data-invalid={
                    errors.status ? true : undefined
                  }
                >
                  <FieldLabel htmlFor="status">
                    ステータス
                  </FieldLabel>

                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(
                        value as BotFormData["status"],
                      )
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className="w-full"
                      aria-invalid={Boolean(
                        errors.status,
                      )}
                      aria-describedby={
                        errors.status
                          ? "status-error"
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
                    <FieldError id="status-error">
                      {errors.status[0]}
                    </FieldError>
                  )}
                </Field>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit">
                    作成内容を確認
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                  >
                    入力をリセット
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>作成内容</CardTitle>

            <CardDescription>
              Zodの検証に成功した内容を表示します。
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submittedBot ? (
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Bot名
                  </p>

                  <p className="font-semibold">
                    {submittedBot.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    説明
                  </p>

                  <p>
                    {submittedBot.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    システムプロンプト
                  </p>

                  <p className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-4">
                    {submittedBot.systemPrompt}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    ステータス
                  </p>

                  <p>{submittedBot.status}</p>
                </div>

                <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  Zodのバリデーションに成功しました。
                  データベースへの保存は後の課題で
                  実装します。
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                正しい内容を入力して
                「作成内容を確認」を押すと、
                ここに内容が表示されます。
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}