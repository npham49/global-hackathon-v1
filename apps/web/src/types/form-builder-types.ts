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
