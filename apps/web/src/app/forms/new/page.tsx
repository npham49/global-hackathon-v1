"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFormAction } from "@/app/actions/forms-actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Create a simplified schema with only the fields we need
// This avoids the massive recursive type that breaks IntelliSense
// See: https://github.com/colinhacks/zod/issues/3233#issuecomment-2588511633
const formSchema = z.object({
  data: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    schema: z.record(z.string(), z.unknown()),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewFormPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: {
        title: "",
        description: "",
        schema: {},
      },
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        // Use our simplified type that matches the server action's expected input
        // This avoids the circular dependency while maintaining type safety
        const result = await createFormAction(values);

        if (result?.data) {
          toast.success("Form created successfully!");
          router.push("/forms");
          router.refresh();
        } else if (result?.serverError) {
          toast.error(result.serverError);
        } else if (result?.validationErrors) {
          toast.error("Validation failed. Please check your inputs. " + JSON.stringify(result.validationErrors?.data));
        }
      } catch {
        toast.error("Failed to create form. Please try again.");
      }
    });
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Link
        href="/forms"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Forms
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="data.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter form title"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter form description"
                        rows={4}
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
