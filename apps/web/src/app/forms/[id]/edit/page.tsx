"use client";

import { useRouter, useParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formUpdateAction } from "@/app/actions/forms-actions";
import { checkFormPermissionAndResturnFormIfOkay } from "@/app/actions/forms-actions";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formUpdateSchema } from "@/lib/zod-schemas/forms";
import FormBuilder from "@/components/form-builder";
import FormRenderer from "@/components/form-renderer/form-renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FormSchema } from "@/types/form-builder-types";

type FormValues = z.infer<typeof formUpdateSchema>;

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formSchema, setFormSchema] = useState<FormSchema>({ form: [] });
  const [submission, setSubmission] = useState<Record<string, string | number>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formUpdateSchema),
    defaultValues: {
      data: {
        id: formId,
        title: "",
        description: "",
        schema: {},
      },
    },
  });

  useEffect(() => {
    const loadFormAndCheckPermission = async () => {
      try {
        const [permissionResult] = await Promise.all([
          checkFormPermissionAndResturnFormIfOkay({ formId }),
        ]);

        if (permissionResult?.data) {
          setHasPermission(true);

          if (permissionResult?.data.form) {
            const formData = permissionResult.data.form;
            form.reset({
              data: {
                id: formId,
                title: formData.title,
                description: formData.description,
                schema: formData.schema,
              },
            });

            // Initialize form builder schema
            if (formData.schema && typeof formData.schema === 'object' && 'form' in formData.schema) {
              setFormSchema(formData.schema as unknown as FormSchema);
            }
          }
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error("Error loading form:", error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormAndCheckPermission();
  }, [formId, form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        // Merge form schema into values
        const submitValues = {
          ...values,
          data: {
            ...values.data,
            schema: formSchema,
          },
        };

        const result = await formUpdateAction(submitValues);

        if (result?.data) {
          toast.success("Form updated successfully!");
          router.push("/forms");
          router.refresh();
        } else if (result?.serverError) {
          toast.error(result.serverError);
        } else if (result?.validationErrors) {
          toast.error("Validation failed. Please check your inputs.");
        }
      } catch {
        toast.error("Failed to update form. Please try again.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-10">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="container max-w-2xl mx-auto py-10">
        <Link
          href="/forms"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forms
        </Link>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to edit this form. Please contact the form owner.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Link
        href="/forms"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Forms
      </Link>

      <div className="space-y-6">
        {/* Form Details */}
        <Card>
          <CardHeader>
            <CardTitle>Form Details</CardTitle>
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
                    Update Form
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Form Builder and Preview Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Form Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="builder" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="builder">Form Builder</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="builder" className="mt-6">
                <FormBuilder schema={formSchema} setSchema={setFormSchema} />
              </TabsContent>
              <TabsContent value="preview" className="mt-6">
                <FormRenderer
                  schema={formSchema}
                  submission={submission}
                  setSubmission={setSubmission}
                  handleSubmit={() => {
                    toast.success("Form submitted! (Preview mode)");
                  }}
                  preview={true}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
