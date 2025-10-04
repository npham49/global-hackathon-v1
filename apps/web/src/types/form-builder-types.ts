export interface FormField {
  id: string;
  key: string;
  title: string;
  description: string;
  required: boolean;
  type: "text" | "likert";
}

export interface FormSchema {
  form: Omit<FormField, "id">[];
}

export interface FormBuilderProps {
  schema: FormSchema;
  setSchema: (schema: FormSchema) => void;
}

export interface ValidationError {
  key: string;
  message: string;
}

export interface FormRendererProps {
  schema: FormSchema;
  submission: Record<string, string | number>;
  setSubmission: (submission: Record<string, string | number>) => void;
  handleSubmit: () => void;
  preview?: boolean;
  readOnly?: boolean;
}
