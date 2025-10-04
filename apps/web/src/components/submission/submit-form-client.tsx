"use client";

import { useState, useEffect } from "react";
import FormRenderer from "@/components/form-renderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TokenInputModal from "@/components/submission/token-input-modal";
import { submitFormAction } from "@/app/actions/submission-actions";
import type { FormSchema } from "@/types/form-builder-types";

type Form = {
  id: string;
  title: string;
  description: string;
  schema: unknown;
};

export default function SubmitFormClient({
  formId,
  token,
  form,
}: {
  formId: string;
  token: string | null;
  form: Form | null;
}) {
  const [submission, setSubmission] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    // Check if user has already submitted this form
    const cookieName = `form_submitted_${formId}`;
    const hasSubmitted = document.cookie.split("; ").some((cookie) => cookie.startsWith(`${cookieName}=`));
    if (hasSubmitted) {
      setAlreadySubmitted(true);
    }
  }, [formId]);

  const handleSubmit = async () => {
    if (!token || !form || alreadySubmitted) return;

    try {
      const result = await submitFormAction({ formId, token, data: submission });
      if (result?.data?.success) {
        // Set cookie to prevent resubmission (expires in 1 year)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `form_submitted_${formId}=true; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;

        setSubmitted(true);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  // Show token input modal
  if (!token) {
    return <TokenInputModal formId={formId} />;
  }

  // Show access denied
  if (!form) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. The token is invalid or has expired.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show success state
  if (submitted || alreadySubmitted) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {alreadySubmitted
              ? "You have already submitted this form. Thank you for your response."
              : "Submission successful! Thank you for your response."}
          </AlertDescription>
        </Alert>
        {!alreadySubmitted && (
          <Card>
            <CardHeader>
              <CardTitle>{form.title}</CardTitle>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <FormRenderer
                schema={form.schema as FormSchema}
                submission={submission}
                setSubmission={setSubmission}
                handleSubmit={() => { }}
                readOnly={true}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show form
  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Voice Agent Teaser */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Mic className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">AI Voice Agent Available</h3>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Coming Soon
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete this survey naturally through conversation with our AI voice assistant.
                This feature is currently in closed demo.
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="mt-2"
              >
                <Mic className="mr-2 h-4 w-4" />
                Start Voice Survey (Demo Only)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Form */}
      <Card>
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          <CardDescription>{form.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <FormRenderer
            schema={form.schema as FormSchema}
            submission={submission}
            setSubmission={setSubmission}
            handleSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
