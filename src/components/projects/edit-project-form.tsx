"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProjectSchema } from "@/zodSchemas";
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
import { ArrowLeft, ImageIcon, Loader } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import type { Doc, Id } from "convex/_generated/dataModel";
import useConfirm from "@/hooks/use-confirm";
import { useProjectId } from "@/hooks/use-project-id";

interface EditProjectFormProps {
  onCancel?: () => void;
  initialValues: Doc<"projects">;
}

function editProjectForm({ onCancel, initialValues }: EditProjectFormProps) {
  const router = useRouter();
  const [DeleteDialog, confirmDelete] = useConfirm({
    title: "Delete Project",
    message: "This action cannot be undone.",
    variant: "destructive",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { workspaceId } = useWorkspaceId();
  const { projectId } = useProjectId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, _setIsPending] = useState(false);
  const form = useForm<z.infer<typeof updateProjectSchema>>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: initialValues.name,
      thumbnail: undefined,
    },
  });
  const { mutateAsync: updateProjectAsync } = useMutation({
    mutationFn: useConvexMutation(api.projects.updateById),
    onSuccess: () => {
      toast.success(`Project Updated`);
      onCancel?.();
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
  const { mutateAsync: deleteProject } = useMutation({
    mutationFn: useConvexMutation(api.projects.remove),
    onSuccess: () => {
      toast.success("Project deleted!");
      router.push(
        `/workspaces/projects?workspace=${workspaceId}&project=${projectId}`,
      );
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const handleDelete = async () => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteProject({ workspaceId, projectId });
  };

  const onSubmit = async (values: z.infer<typeof updateProjectSchema>) => {
    setIsSubmitting(true);
    try {
      if (!values.thumbnail) {
        await updateProjectAsync({
          workspaceId,
          projectId,
          name: values.name,
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
      await updateProjectAsync({
        workspaceId,
        projectId,
        name: values.name,
        thumbnail: storageId as Id<"_storage"> | undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex flex-col gap-y-4">
      <DeleteDialog />
      <Card className="h-full w-full border-none shadow-none">
        <CardHeader className="flex items-center space-y-0 gap-x-4 p-7">
          <Button
            size={"sm"}
            variant={"secondary"}
            onClick={
              onCancel
                ? onCancel
                : () =>
                    router.push(
                      `/workspaces/projects?workspace=${workspaceId}&project=${projectId}`,
                    )
            }
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValues.name}
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
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
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
                <div className="flex items-center justify-end">
                  <Button size="lg" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader className="animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="h-full w-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-muted-foreground text-sm">
              Deleting a project is a irreversible action and will remove all
              associated data
            </p>
            <Button
              className="mt-6 ml-auto w-fit"
              size="sm"
              variant={"destructive"}
              type="button"
              disabled={isPending}
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default editProjectForm;
