import type { FormSchema, ValidationError } from "@/types/form-builder-types";

// Likert scale options
export const LIKERT_OPTIONS = [
  { value: "1", label: "Strongly Disagree" },
  { value: "2", label: "Disagree" },
  { value: "3", label: "Neutral" },
  { value: "4", label: "Agree" },
  { value: "5", label: "Strongly Agree" },
] as const;

// Helper function to generate snake_case key from title
export const generateKey = (title: string, existingKeys: string[]): string => {
  const words = title.trim().toLowerCase().split(/\s+/).slice(0, 3);
  const baseKey = words.join("_").replace(/[^a-z0-9_]/g, "");

  // Ensure uniqueness
  let key = baseKey;
  let counter = 1;
  while (existingKeys.includes(key)) {
    key = `${baseKey}_${counter}`;
    counter++;
  }

  return key;
};

// Validate form submission
export const validateForm = (
  schema: FormSchema,
  submission: Record<string, string | number>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  schema.form.forEach((field) => {
    if (field.required) {
      const value = submission[field.key];
      if (value === undefined || value === null || value === "") {
        errors.push({
          key: field.key,
          message: "This answer is required",
        });
      } else if (field.type === "likert" && typeof value !== "number") {
        errors.push({
          key: field.key,
          message: "This answer is required",
        });
      }
    }
  });

  return errors;
};
