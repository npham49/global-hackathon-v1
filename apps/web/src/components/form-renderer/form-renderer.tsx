"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { FormRendererProps, ValidationError } from "@/types/form-builder-types";
import { LIKERT_OPTIONS, validateForm } from "@/lib/utils/form-builder-utils";

export default function FormRenderer({
  schema,
  submission,
  setSubmission,
  handleSubmit,
  preview = false,
}: FormRendererProps) {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showSubmittedData, setShowSubmittedData] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(schema, submission);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    // In preview mode, just show the data in the banner
    if (preview) {
      setShowSubmittedData(true);
    } else {
      handleSubmit();
    }
  };

  const updateField = (key: string, value: string | number) => {
    setSubmission({ ...submission, [key]: value });
    // Clear error for this field
    setErrors(errors.filter((e) => e.key !== key));
  };

  const getError = (key: string) => errors.find((e) => e.key === key);

  return (
    <div className="space-y-6">
      {preview && showSubmittedData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Preview Mode - Submitted Data:</p>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(submission, null, 2)}
              </pre>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {preview && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Preview Mode - You can test the form here
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {schema.form.map((field) => {
          const error = getError(field.key);

          return (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-base font-medium">
                {field.title}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-sm text-muted-foreground">{field.description}</p>
              )}

              {field.type === "text" ? (
                <Textarea
                  id={field.key}
                  value={(submission[field.key] as string) || ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder="Enter your answer"
                  rows={4}
                  className={error ? "border-destructive" : ""}
                />
              ) : (
                <RadioGroup
                  value={String(submission[field.key] || "")}
                  onValueChange={(value) => updateField(field.key, parseInt(value))}
                  className={error ? "border border-destructive rounded-md p-3" : ""}
                >
                  <div className="flex flex-wrap gap-4">
                    {LIKERT_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${field.key}-${option.value}`} />
                        <Label
                          htmlFor={`${field.key}-${option.value}`}
                          className="font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {error && <p className="text-sm text-destructive">{error.message}</p>}
            </div>
          );
        })}

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
}
