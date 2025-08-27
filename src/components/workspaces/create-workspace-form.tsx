"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkspaceSchema } from "@/zodSchemas";
import type z from "zod";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "convex/_generated/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import Image from "next/image";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ImageIcon } from "lucide-react";
import { useRef } from "react";

interface CreateWorkspaceFormProps {
  onCancel?: () => void;
}

function CreateWorkSpaceForm({ onCancel }: CreateWorkspaceFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      thumbnail: undefined,
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: useConvexMutation(api.workspaces.create),
    onSuccess: () => {
      toast.success("Workspace Created");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to create Workspace");
    },
  });
  const { mutateAsync: generateUploadUrl } = useMutation({
    mutationFn: useConvexMutation(api.upload.generateUploadUrl),
  });
  const onSubmit = async (values: z.infer<typeof createWorkspaceSchema>) => {
    if (!values.thumbnail) mutate({ name: values.name });
    const postUrl = await generateUploadUrl({});
    const results = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.thumbnail.type },
      body: values.thumbnail,
    });
    const { storageId } = await results.json();
    mutate({ name: values.name, thumbnail: storageId });
  };
  return (
    <Card className="h-full w-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new workspace
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workspace Name</FormLabel>
                    <FormControl>
                      <Input
                        required
                        {...field}
                        placeholder="Enter workplace name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? (
                        <div className="relative size-18 overflow-hidden rounded-md">
                          <Image
                            fill
                            src={
                              field.value instanceof File
                                ? URL.createObjectURL(field.value)
                                : field.value
                            }
                            alt="Upload"
                          />
                        </div>
                      ) : (
                        <Avatar className="size-18">
                          <AvatarFallback>
                            <ImageIcon className="size-[36px] text-neutral-400" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <p className="text-sm">Workspace Icon</p>
                        <p className="text-muted-foreground text-sm">
                          JPG, PNG, SVG, or JPEG
                        </p>

                        <input
                          className="hidden"
                          type="file"
                          accept="image/*"
                          name={field.name}
                          onBlur={field.onBlur}
                          ref={inputRef}
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                        <Button
                          type="button"
                          disabled={isPending}
                          variant="secondary"
                          size="icon"
                          className="mt-2 w-fit"
                          onClick={() => inputRef.current?.click()}
                        >
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              />
              <Separator className="h-0.5" />
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>

                <Button size="lg" disabled={isPending}>
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default CreateWorkSpaceForm;
