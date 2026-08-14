"use client";

import {
  useState,
  useTransition,
} from "react";

import { deleteBotAction } from "@/app/bots/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteBotButtonProps = {
  botId: number;
  botName: string;
};

export function DeleteBotButton({
  botId,
  botName,
}: DeleteBotButtonProps) {
  const [error, setError] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const handleDelete = () => {
    setError(null);

    startTransition(async () => {
      const result =
        await deleteBotAction(botId);

      if (!result.success) {
        setError(result.message);
      }
    });
  };

  return (
    <div className="space-y-3">
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
            />
          }
        >
          削除する
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Botを削除しますか？
            </AlertDialogTitle>

            <AlertDialogDescription>
              「{botName}」を削除します。
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              キャンセル
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isPending}
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending
                ? "削除中..."
                : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {error && (
        <p
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}