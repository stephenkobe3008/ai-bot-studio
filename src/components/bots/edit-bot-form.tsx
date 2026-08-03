"use client";

import type { SubmitEvent } from "react";
import { useState } from "react";
import * as z from "zod";

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
import type { Bot } from "@/data/bots";
import {
  botSchema,
  type BotFormData,
} from "@/schemas/bot";

type EditBotFormProps = {
  initialBot: Bot;
};

type BotFormErrors = Partial<
  Record<keyof BotFormData, string[]>
>;

export function EditBotForm({
  initialBot,
}: EditBotFormProps) {
  const [name, setName] = useState(initialBot.name);

  const [description, setDescription] = useState(
    initialBot.description,
  );

  const [systemPrompt, setSystemPrompt] = useState(
    initialBot.systemPrompt,
  );

  const [status, setStatus] =
    useState<BotFormData["status"]>(
      initialBot.status,
    );

  const [validatedBot, setValidatedBot] =
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
      const flattenedErrors = z.flattenError(
        result.error,
      );

      setErrors(flattenedErrors.fieldErrors);
      setValidatedBot(null);

      return;
    }

    setErrors({});

    setName(result.data.name);
    setDescription(result.data.description);
    setSystemPrompt(result.data.systemPrompt);
    setStatus(result.data.status);

    setValidatedBot(result.data);
  };

  const handleReset = () => {
    setName(initialBot.name);
    setDescription(initialBot.description);
    setSystemPrompt(initialBot.systemPrompt);
    setStatus(initialBot.status);

    setValidatedBot(null);
    setErrors({});
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>編集フォーム</CardTitle>

          <CardDescription>
            Botの現在の情報が初期値として
            入力されています。
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

              <div className="flex flex-wrap gap-3">
                <Button type="submit">
                  変更内容を確認
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                >
                  元の内容に戻す
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>変更内容</CardTitle>

          <CardDescription>
            Zodの検証に成功した内容を表示します。
          </CardDescription>
        </CardHeader>

        <CardContent>
          {validatedBot ? (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">
                  Bot名
                </p>

                <p className="font-semibold">
                  {validatedBot.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  説明
                </p>

                <p>{validatedBot.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  システムプロンプト
                </p>

                <p className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-4">
                  {validatedBot.systemPrompt}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  ステータス
                </p>

                <p>{validatedBot.status}</p>
              </div>

              <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                編集内容の検証に成功しました。
                データベースへの更新処理は、
                Prisma導入後に実装します。
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              内容を変更して
              「変更内容を確認」を押すと、
              ここに変更内容が表示されます。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}