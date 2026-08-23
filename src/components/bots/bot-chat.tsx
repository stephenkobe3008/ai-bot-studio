"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import {
  useRef,
  useState,
} from "react";

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

type StreamEvent =
  | {
      type: "conversation";
      conversationId: number;
    }
  | {
      type: "delta";
      delta: string;
    }
  | {
      type: "done";
    }
  | {
      type: "error";
      message: string;
    };

export function BotChat({
  botId,
  botName,
  initialConversationId,
  initialMessages = [],
}: BotChatProps) {
  const router = useRouter();

  const abortControllerRef =
    useRef<AbortController | null>(
      null,
    );

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

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

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

    const abortController =
      new AbortController();

    abortControllerRef.current =
      abortController;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedMessage,
    };

    const assistantMessageId =
      crypto.randomUUID();

    const assistantMessage:
      ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    setMessages(
      (currentMessages) => [
        ...currentMessages,
        userMessage,
        assistantMessage,
      ],
    );

    setMessage("");

    let receivedConversationId =
      conversationId;

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

          signal:
            abortController.signal,
        },
      );

      if (!response.ok) {
        const data =
          (await response.json()) as {
            error?: string;
          };

        throw new Error(
          data.error ??
            "AIから回答を取得できませんでした。",
        );
      }

      if (!response.body) {
        throw new Error(
          "ストリーミングレスポンスを取得できませんでした。",
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let buffer = "";

      while (true) {
        const {
          value,
          done,
        } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(
          value,
          {
            stream: true,
          },
        );

        const blocks =
          buffer.split("\n\n");

        buffer =
          blocks.pop() ?? "";

        for (const block of blocks) {
          const dataLine =
            block
              .split("\n")
              .find((line) =>
                line.startsWith(
                  "data: ",
                ),
              );

          if (!dataLine) {
            continue;
          }

          const streamEvent =
            JSON.parse(
              dataLine.slice(6),
            ) as StreamEvent;

          if (
            streamEvent.type ===
            "conversation"
          ) {
            receivedConversationId =
              streamEvent.conversationId;

            setConversationId(
              streamEvent.conversationId,
            );

            continue;
          }

          if (
            streamEvent.type ===
            "delta"
          ) {
            setMessages(
              (currentMessages) =>
                currentMessages.map(
                  (chatMessage) =>
                    chatMessage.id ===
                    assistantMessageId
                      ? {
                          ...chatMessage,

                          content:
                            chatMessage.content +
                            streamEvent.delta,
                        }
                      : chatMessage,
                ),
            );

            continue;
          }

          if (
            streamEvent.type ===
            "error"
          ) {
            throw new Error(
              streamEvent.message,
            );
          }

          if (
            streamEvent.type ===
            "done"
          ) {
            if (
              receivedConversationId
            ) {
              setConversationId(
                receivedConversationId,
              );

              if (
                conversationId ===
                null
              ) {
                router.replace(
                  `/bots/${botId}/chat?conversationId=${receivedConversationId}`,
                  {
                    scroll: false,
                  },
                );
              } else {
                router.refresh();
              }
            }
          }
        }
      }
    } catch (error) {
      const isAbort =
        abortController.signal.aborted;

      if (isAbort) {
        setError(null);

        setMessages(
          (currentMessages) =>
            currentMessages.filter(
              (chatMessage) =>
                !(
                  chatMessage.id ===
                    assistantMessageId &&
                  chatMessage.content ===
                    ""
                ),
            ),
        );

        if (
          receivedConversationId
        ) {
          setConversationId(
            receivedConversationId,
          );

          if (
            conversationId ===
            null
          ) {
            window.history.replaceState(
              null,
              "",
              `/bots/${botId}/chat?conversationId=${receivedConversationId}`,
            );
          }
        }

        return;
      }

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "予期しないエラーが発生しました。",
        );
      }

      setMessages(
        (currentMessages) =>
          currentMessages.filter(
            (chatMessage) =>
              !(
                chatMessage.id ===
                  assistantMessageId &&
                chatMessage.content ===
                  ""
              ),
          ),
      );
    } finally {
      abortControllerRef.current =
        null;

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
          AIの回答をリアルタイムで表示します。
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

                  {chatMessage.role ===
                    "assistant" &&
                  chatMessage.content ===
                    "" &&
                  isLoading ? (
                    <p className="text-sm text-muted-foreground">
                      AIが回答を考えています...
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap leading-7">
                      {
                        chatMessage.content
                      }
                    </p>
                  )}
                </div>
              ),
            )
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
            {isLoading ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleStop}
              >
                回答を停止
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={
                  !message.trim()
                }
              >
                送信する
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}