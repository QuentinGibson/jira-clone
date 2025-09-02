"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema } from "@/zodSchemas";
import type z from "zod";
import { workspaecImageOptimization } from "@/lib/workspaceImageOptimization";
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
import { ImageIcon, Loader } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter, redirect, useParams } from "next/navigation";
import { useProjectId } from "@/hooks/use-project-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import type { Id } from "convex/_generated/dataModel";
import { createSerializer, parseAsBoolean, parseAsString } from "nuqs";
import type { Route } from "next";

interface CreateProjectFormProps {
  onCancel?: () => void;
}

function CreateProjectForm({ onCancel }: CreateProjectFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setProjectId } = useProjectId();
  const { workspaceId } = useWorkspaceId();
  if (!workspaceId) throw new Error("No Workspace found!");
  const router = useRouter();
  const searchParams = {
    workspace: parseAsString,
    project: parseAsString,
    "create-project": parseAsBoolean,
  };
  const serialize = createSerializer(searchParams);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      thumbnail: undefined,
    },
  });

  const { mutateAsync: createProjectAsync } = useMutation({
    mutationFn: useConvexMutation(api.projects.create),
    onSuccess: (id: string) => {
      const href = serialize(`/workspaces/projects`, {
        workspace: workspaceId,
        project: id,
      }) as Route;
      form.reset();
      router.push(href);
      toast.success("Project Created");
      // onCancel?.();
    },
    onError: (error) => {
      let errorMessage = "Failed to create project";

      if (error?.message?.includes("not unique")) {
        errorMessage =
          "A project with this name already exists. Please choose a different name.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      form.setError("name", { message: errorMessage });
    },
  });
  const { mutateAsync: generateUploadUrl } = useMutation({
    mutationFn: useConvexMutation(api.upload.generateUploadUrl),
  });
  const onSubmit = async (values: z.infer<typeof createProjectSchema>) => {
    setIsSubmitting(true);
    try {
      if (!values.thumbnail) {
        await createProjectAsync({
          name: values.name,
          workspaceId: workspaceId as Id<"workspaces">,
        });
        return;
      }
      const optimizedImage = await workspaecImageOptimization(values.thumbnail);
      const postUrl = await generateUploadUrl({});
      const results = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": optimizedImage.type },
        body: optimizedImage,
      });
      const { storageId } = await results.json();
      await createProjectAsync({
        name: values.name,
        thumbnail: storageId as Id<"_storage">,
        workspaceId: workspaceId as Id<"workspaces">,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card className="h-full w-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new project
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
                    <FormLabel>Project Name</FormLabel>
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
                        <p className="text-sm">Project Icon</p>
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
                          disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button size="lg" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default CreateProjectForm;
