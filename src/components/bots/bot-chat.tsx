"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type BotChatProps = {
  botId: number;
  botName: string;

  initialConversationId?: number;

  initialMessages?: ChatMessage[];
};

type ChatApiResponse = {
  reply?: string;
  conversationId?: number;
  error?: string;
};

export function BotChat({
  botId,
  botName,
  initialConversationId,
  initialMessages = [],
}: BotChatProps) {
  const router = useRouter();

  const [
    conversationId,
    setConversationId,
  ] = useState<number | null>(
    initialConversationId ?? null,
  );

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<ChatMessage[]>(
      initialMessages,
    );

  const [error, setError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const handleSubmit = async (
    event: SubmitEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      isLoading
    ) {
      return;
    }

    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages(
      (currentMessages) => [
        ...currentMessages,
        userMessage,
      ],
    );

    setMessage("");

    try {
      const response = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            botId,

            conversationId:
              conversationId ??
              undefined,

            message:
              trimmedMessage,
          }),
        },
      );

      const data =
        (await response.json()) as ChatApiResponse;

      if (
        !response.ok ||
        !data.reply ||
        !data.conversationId
      ) {
        throw new Error(
          data.error ??
            "AIから回答を取得できませんでした。",
        );
      }

      const assistantMessage:
        ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
      };

      setMessages(
        (currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ],
      );

      if (
        conversationId === null
      ) {
        setConversationId(
          data.conversationId,
        );

        router.replace(
          `/bots/${botId}/chat?conversationId=${data.conversationId}`,
          {
            scroll: false,
          },
        );
      }

      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "予期しないエラーが発生しました。",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {botName}とチャット
        </CardTitle>

        <CardDescription>
          メッセージはデータベースに保存されます。
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="min-h-80 space-y-4 rounded-lg border bg-muted/30 p-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              まだメッセージはありません。
              Botに質問してみてください。
            </p>
          ) : (
            messages.map(
              (chatMessage) => (
                <div
                  key={chatMessage.id}
                  className={
                    chatMessage.role ===
                    "user"
                      ? "ml-auto max-w-[80%] rounded-lg bg-primary p-3 text-primary-foreground"
                      : "mr-auto max-w-[80%] rounded-lg bg-background p-3 shadow-sm"
                  }
                >
                  <p className="mb-1 text-xs opacity-70">
                    {chatMessage.role ===
                    "user"
                      ? "あなた"
                      : botName}
                  </p>

                  <p className="whitespace-pre-wrap leading-7">
                    {
                      chatMessage.content
                    }
                  </p>
                </div>
              ),
            )
          )}

          {isLoading && (
            <div className="mr-auto max-w-[80%] rounded-lg bg-background p-3 shadow-sm">
              <p className="text-sm text-muted-foreground">
                AIが回答を考えています...
              </p>
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
        >
          <Textarea
            value={message}
            disabled={isLoading}
            onChange={(event) =>
              setMessage(
                event.target.value,
              )
            }
            placeholder={`${botName}に質問する`}
            rows={4}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isLoading ||
                !message.trim()
              }
            >
              {isLoading
                ? "送信中..."
                : "送信する"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}