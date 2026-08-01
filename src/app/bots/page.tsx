import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { bots } from "@/data/bots";

export default function BotsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bot一覧</h1>

          <p className="mt-2 text-muted-foreground">
            作成したAI Botを管理します。
          </p>
        </div>

        <Link
          href="/bots/new"
          className={buttonVariants({
            variant: "default",
          })}
        >
          Botを作成
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle>{bot.name}</CardTitle>

                  <CardDescription>
                    Bot ID：{bot.id}
                  </CardDescription>
                </div>

                <Badge
                  variant={
                    bot.status === "公開中"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    bot.status === "公開中"
                      ? "bg-green-600 text-white"
                      : undefined
                  }
                >
                  {bot.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-7 text-muted-foreground">
                {bot.description}
              </p>
            </CardContent>

            <CardFooter>
              <Link
                href={`/bots/${bot.id}`}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full",
                })}
              >
                詳細を見る
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Link
        href="/"
        className={buttonVariants({
          variant: "link",
          className:
            "mt-10 h-auto px-0 text-muted-foreground",
        })}
      >
        トップページへ戻る
      </Link>
    </main>
  );
}