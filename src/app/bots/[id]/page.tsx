import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { bots } from "@/data/bots";

type BotDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BotDetailPage({
  params,
}: BotDetailPageProps) {
  const { id } = await params;

  const botId = Number(id);

  const bot = bots.find(
    (currentBot) => currentBot.id === botId,
  );

  if (!bot) {
    notFound();
  }

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

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardDescription>
                Bot ID：{bot.id}
              </CardDescription>

              <CardTitle className="text-3xl">
                {bot.name}
              </CardTitle>
            </div>

            <Badge
              variant={
                bot.status === "公開中"
                  ? "default"
                  : "secondary"
              }
              className={
                bot.status === "公開中"
                  ? "w-fit bg-green-600 text-white"
                  : "w-fit"
              }
            >
              {bot.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <section className="space-y-2">
            <h2 className="font-semibold">説明</h2>

            <p className="leading-7 text-muted-foreground">
              {bot.description}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold">
              システムプロンプト
            </h2>

            <p className="whitespace-pre-wrap rounded-md bg-muted p-4 leading-7">
              {bot.systemPrompt}
            </p>
          </section>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3">
          <Link
            href={`/bots/${bot.id}/edit`}
            className={buttonVariants({
              variant: "default",
            })}
          >
            編集する
          </Link>

          <Button
            type="button"
            variant="destructive"
          >
            削除する
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}