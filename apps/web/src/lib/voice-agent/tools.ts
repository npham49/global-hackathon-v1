import { FormSchema } from "@/types/form-builder-types";

/**
 * Creates the update_submission tool definition for the voice agent
 * Note: Actual state update is handled manually in the history handler
 */
export function createUpdateSubmissionTool(
  _setSubmission: React.Dispatch<
    React.SetStateAction<Record<string, string | number>>
  >
) {
  return {
    type: "function" as const,
    name: "update_submission",
    description:
      "Updates the survey submission with a user's answer to a specific question. Call this immediately when you receive an answer.",
    strict: true,
    parameters: {
      type: "object" as const,
      properties: {
        key: {
          type: "string" as const,
          description:
            "The field key from the survey schema (e.g., 'employee_satisfaction', 'feedback')",
        },
        value: {
          type: "string" as const,
          description:
            "The user's answer to the question. For text questions use string, for likert scale use number as string (e.g., '3').",
        },
      },
      required: ["key", "value"],
      additionalProperties: false,
    },
    invoke: async (
      _runContext: unknown,
      _input: string,
      _details?: { toolCall: { arguments?: string } }
    ) => {
      // This tool is processed manually in the history handler
      // Just return empty string so agent doesn't acknowledge
      console.log(
        "[Tool] update_submission invoke called - handled by history handler"
      );
      return "";
    },
    needsApproval: () => Promise.resolve(false),
    isEnabled: () => Promise.resolve(true),
  };
}

/**
 * Creates the validate_submission tool definition for the voice agent
 * TODO: Re-enable validation in future if needed
 * Currently disabled as validation logic needs refinement
 */
export function createValidateSubmissionTool(
  _schema: FormSchema,
  _getSubmission: () => Record<string, string | number>
) {
  return {
    type: "function" as const,
    name: "validate_submission",
    description:
      "[DISABLED] Validates the current submission to check if all required questions have been answered.",
    strict: true,
    parameters: {
      type: "object" as const,
      properties: {},
      required: [],
      additionalProperties: false,
    },
    invoke: async () => {
      // Validation disabled - just return success
      console.log("[Tool] validate_submission - skipped (disabled)");
      return "VALIDATION_SUCCESS: Proceeding without validation.";

      /* FUTURE IMPLEMENTATION:
      const submission = getSubmission();
      console.log("[Tool] validate_submission - validating:", submission);

      const { validateForm } = await import("@/lib/utils/form-builder-utils");
      const errors = validateForm(schema, submission);

      if (errors.length > 0) {
        console.log("[Tool] Validation failed:", errors);
        const errorMessages = errors
          .map((err) => {
            const field = schema.form.find((f) => f.key === err.key);
            return field ? `"${field.title}"` : err.key;
          })
          .join(", ");
        return `VALIDATION_FAILED: Missing required questions: ${errorMessages}. Please ask for these answers.`;
      }

      console.log("[Tool] Validation passed!");
      return "VALIDATION_SUCCESS: All required questions have been answered.";
      */
    },
    needsApproval: () => Promise.resolve(false),
    isEnabled: () => Promise.resolve(true),
  };
}

/**
 * Creates the submit_form tool definition for the voice agent
 */
export function createSubmitFormTool(
  handleSubmit: (
    submissionData?: Record<string, string | number>
  ) => Promise<void>,
  disconnect: () => void
) {
  return {
    type: "function" as const,
    name: "submit_form",
    description:
      "Submits the validated form and disconnects the voice session. Only call this after validation succeeds and user confirms they want to submit.",
    strict: true,
    parameters: {
      type: "object" as const,
      properties: {},
      required: [],
      additionalProperties: false,
    },
    invoke: async () => {
      // Execute submission logic directly in invoke
      try {
        await handleSubmit();
        console.log("[Tool] Form submitted successfully!");

        // Disconnect after a small delay
        setTimeout(() => {
          console.log("[Tool] Disconnecting after successful submission...");
          disconnect();
        }, 2000);

        return "SUBMISSION_SUCCESS: Your survey has been submitted successfully! Thank you for your feedback.";
      } catch (error) {
        console.error("[Tool] Submission failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return `SUBMISSION_FAILED: ${errorMessage}. Please ask user to use the manual form.`;
      }
    },
    needsApproval: () => Promise.resolve(false),
    isEnabled: () => Promise.resolve(true),
  };
}
