import { Type, SlidersHorizontal } from "lucide-react";

export const FIELD_TYPES = [
  { id: "text", label: "Text Area", icon: Type, type: "text" as const },
  {
    id: "likert",
    label: "Likert Scale",
    icon: SlidersHorizontal,
    type: "likert" as const,
  },
];
