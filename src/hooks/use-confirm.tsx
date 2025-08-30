"use client";

import { useState, type ComponentProps, type JSX } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VariantProps } from "class-variance-authority";
import ResponsiveModal from "@/components/responsive-modal";

interface useConfirmProps {
  title: string;
  message: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

function useConfirm({
  title,
  message,
  variant = "default",
}: useConfirmProps): [() => JSX.Element, () => Promise<unknown>] {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);
  const confirm = () => {
    return new Promise((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };
  const ConfirmationDialog = () => (
    <ResponsiveModal open={promise !== null} onOpenChange={handleClose}>
      <Card className="h-full w-full border-none shadow-none">
        <CardContent className="pt-8">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <div className="flex w-full flex-col items-center justify-end gap-x-2 gap-y-2 pt-4 lg:flex-row">
            <Button
              onClick={handleCancel}
              variant={"outline"}
              className="w-full lg:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              variant={variant}
              className="w-full lg:w-auto"
            >
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResponsiveModal>
  );

  return [ConfirmationDialog, confirm];
}

export default useConfirm;
