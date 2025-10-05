"use client";

import { useState, useEffect } from "react";
import FormRenderer from "@/components/form-renderer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Mic, Sparkles, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TokenInputModal from "@/components/submission/token-input-modal";
import { submitFormAction } from "@/app/actions/submission-actions";
import type { FormSchema } from "@/types/form-builder-types";
import { useUser } from "@clerk/nextjs";
import { useVoiceAgent } from "@/hooks/use-voice-agent";

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
  const { user } = useUser();
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const handleSubmit = async (submissionData?: Record<string, string | number>) => {
    if (!token || !form || alreadySubmitted) return;
    // If no submission data provided, try to get it from localStorage
    let finalSubmissionData = submissionData;

    if (!finalSubmissionData || Object.keys(finalSubmissionData).length === 0) {
      try {
        const localStorageData = localStorage.getItem("voice_agent_submission");
        if (localStorageData) {
          finalSubmissionData = JSON.parse(localStorageData);
          console.log("[handleSubmit] Using data from localStorage:", finalSubmissionData);
        }
      } catch (err) {
        console.error("[handleSubmit] Error reading localStorage:", err);
      }
    }

    try {
      // Ensure we have data to submit
      if (!finalSubmissionData || Object.keys(finalSubmissionData).length === 0) {
        console.error("[handleSubmit] No submission data available");
        return;
      }

      const result = await submitFormAction({ formId, token, data: finalSubmissionData });

      if (result?.data?.success) {
        // Set cookie to prevent resubmission (expires in 1 year)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `form_submitted_${formId}_token_${token}=true; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict`;

        // Clear localStorage upon successful submission
        try {
          localStorage.removeItem("voice_agent_submission");
        } catch (err) {
          console.error("[handleSubmit] Error clearing localStorage:", err);
        }

        setSubmitted(true);
      } else {
        console.error("Form submission failed:", result);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const {
    isConnected,
    isConnecting,
    error: voiceError,
    messages,
    submission,
    setSubmission,
    connect,
    disconnect,
  } = useVoiceAgent(form?.schema as FormSchema || { form: [] }, handleSubmit);

  useEffect(() => {
    // Check if user has already submitted this form
    const cookieName = `form_submitted_${formId}_token_${token}`;
    const hasSubmitted = document.cookie.split("; ").some((cookie) => cookie.startsWith(`${cookieName}=`));
    if (hasSubmitted) {
      setAlreadySubmitted(true);
    }
  }, [formId, token]);

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
      {/* Voice Agent */}
      {user && (
        <Card className={`border-primary/20 ${isConnected ? 'bg-green-50 dark:bg-green-950/20' : 'bg-primary/5'}`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-primary/10'}`}>
                <Mic className={`h-6 w-6 ${isConnected ? 'text-green-600 dark:text-green-400 animate-pulse' : 'text-primary'}`} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {isConnected ? "Voice Agent Active" : "AI Voice Agent"}
                  </h3>
                  {isConnected && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isConnected
                    ? "Speak naturally to answer the survey questions. The agent will guide you through each question."
                    : "Complete this survey naturally through conversation with our AI voice assistant."}
                </p>
                {voiceError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{voiceError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2 mt-2">
                  {!isConnected ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={connect}
                      disabled={isConnecting}
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      {isConnecting ? "Connecting..." : "Start Voice Survey"}
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={disconnect}
                    >
                      <PhoneOff className="mr-2 h-4 w-4" />
                      End Voice Session
                    </Button>
                  )}
                </div>
                {messages.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-xs font-semibold text-muted-foreground">Conversation:</p>
                    {messages.slice(-5).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-2 rounded ${msg.role === "user"
                          ? "bg-blue-100 dark:bg-blue-900/20 ml-4"
                          : "bg-gray-100 dark:bg-gray-800 mr-4"
                          }`}
                      >
                        <span className="font-semibold capitalize">{msg.role}: </span>
                        {msg.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            handleSubmit={() => handleSubmit(submission)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
