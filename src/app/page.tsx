import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">
            AI Bot Studio
          </CardTitle>

          <CardDescription className="text-base">
            自分専用のAI Botを作成・管理するアプリ
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/bots"
              className={buttonVariants({
                variant: "default",
                className:
                  "h-auto min-h-24 flex-col gap-1",
              })}
            >
              <span className="text-base">
                Bot管理
              </span>

              <span className="text-xs opacity-80">
                作成・編集・チャット
              </span>
            </Link>

            <Link
              href="/logs"
              className={buttonVariants({
                variant: "outline",
                className:
                  "h-auto min-h-24 flex-col gap-1",
              })}
            >
              <span className="text-base">
                Bot Log
              </span>

              <span className="text-xs text-muted-foreground">
                会話・利用状況を見る
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}