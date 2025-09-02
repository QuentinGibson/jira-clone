"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema } from "@/zodSchemas";
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
import { Loader } from "lucide-react";
import { useState } from "react";
import { useProjectId } from "@/hooks/use-project-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import type { Id } from "convex/_generated/dataModel";
import DatePicker from "../date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberAvatar } from "../member-avatar";
import { TaskStatus } from "types";

interface CreateTaskFormProps {
  onCancel?: () => void;
  projectOptions: { _id: string; name: string; imageUrl: string | null }[];
  memberOptions: { _id: string; name: string }[];
  initialStatus?: TaskStatus;
}

function CreateTaskForm({
  onCancel,
  projectOptions,
  memberOptions,
  initialStatus,
}: CreateTaskFormProps) {
  const { projectId } = useProjectId();
  const { workspaceId } = useWorkspaceId();
  if (!workspaceId) throw new Error("No Workspace found!");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: "",
      workspaceId: workspaceId || "",
      projectId: projectId || "",
      assigneeId: "",
      description: "",
      status: initialStatus,
      dueDate: new Date().getTime(),
    },
  });

  const { mutateAsync: createTaskAsync } = useMutation({
    mutationFn: useConvexMutation(api.tasks.create),
    onSuccess: (_id: string) => {
      form.reset();
      //TODO: Redirect to new task
      toast.success("Task Created");
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
  const onSubmit = async (values: z.infer<typeof createTaskSchema>) => {
    setIsSubmitting(true);
    try {
      await createTaskAsync({
        description: values.description,
        projectId: values.projectId as Id<"projects">,
        name: values.name,
        assigneeId: values.assigneeId as Id<"users">,
        dueDate: values.dueDate,
        workspaceId: workspaceId as Id<"workspaces">,
        status: values.status,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Card className="h-full w-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">Create a new task</CardTitle>
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
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input
                        required
                        {...field}
                        placeholder="Enter task name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => field.onChange(date?.getTime())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assingee</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Assingee" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {memberOptions.map((member) => (
                          <SelectItem key={member._id} value={member._id}>
                            <div className="flex items-center gap-x-2">
                              <MemberAvatar
                                className="size-6"
                                name={member.name}
                              />
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {Object.entries(TaskStatus).map(([key, value]) => (
                          <SelectItem key={key} value={value}>
                            {key.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <FormMessage />
                      <SelectContent>
                        {projectOptions.map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            <div className="flex items-center gap-x-2">
                              <MemberAvatar
                                className="size-6"
                                name={project.name}
                              />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
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

export default CreateTaskForm;
