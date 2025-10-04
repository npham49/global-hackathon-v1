"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GripVertical, Trash2, Type, SlidersHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormField {
  id: string;
  key: string;
  title: string;
  description: string;
  required: boolean;
  type: "text" | "likert";
}

interface FormSchema {
  form: Omit<FormField, "id">[];
}

interface FormBuilderProps {
  schema: FormSchema;
  setSchema: (schema: FormSchema) => void;
}

// Helper function to generate snake_case key from title
const generateKey = (title: string, existingKeys: string[]): string => {
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

// Toolbar Component Types
const FIELD_TYPES = [
  { id: "text", label: "Text Area", icon: Type, type: "text" as const },
  { id: "likert", label: "Likert Scale", icon: SlidersHorizontal, type: "likert" as const },
];

// Sortable Field Component
function SortableField({
  field,
  onUpdate,
  onDelete,
  existingKeys,
}: {
  field: FormField;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDelete: (id: string) => void;
  existingKeys: string[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleChange = (newTitle: string) => {
    // Auto-generate key on every title update
    if (newTitle.trim()) {
      const newKey = generateKey(newTitle, existingKeys.filter(k => k !== field.key));
      onUpdate(field.id, { title: newTitle, key: newKey });
    } else {
      // Clear key if title is empty
      onUpdate(field.id, { title: newTitle, key: "" });
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-5 w-5" />
            </button>

            {/* Form Fields */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Key */}
                <div>
                  <Label className="text-xs text-muted-foreground">Key</Label>
                  <Input
                    value={field.key}
                    disabled
                    className="h-9 bg-muted"
                  />
                </div>

                {/* Type */}
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Input
                    value={field.type === "text" ? "Text Area" : "Likert Scale"}
                    disabled
                    className="h-9 bg-muted"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input
                  value={field.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter field title"
                  className="h-9"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Input
                  value={field.description}
                  onChange={(e) => onUpdate(field.id, { description: e.target.value })}
                  placeholder="Enter field description"
                  className="h-9"
                />
              </div>

              {/* Required Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) =>
                    onUpdate(field.id, { required: checked === true })
                  }
                />
                <Label
                  htmlFor={`required-${field.id}`}
                  className="text-sm cursor-pointer"
                >
                  Required field
                </Label>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => onDelete(field.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main Form Builder Component
export default function FormBuilder({ schema, setSchema }: FormBuilderProps) {
  const [fields, setFields] = useState<FormField[]>(() =>
    schema.form.map((field, idx) => ({
      ...field,
      id: `field-${Date.now()}-${idx}`,
    }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync fields to schema
  const updateSchema = (newFields: FormField[]) => {
    setFields(newFields);
    setSchema({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      form: newFields.map(({ id, ...field }) => field),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      updateSchema(arrayMove(fields, oldIndex, newIndex));
    }
  };

  const addField = (type: "text" | "likert") => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      key: "",
      title: "",
      description: "",
      required: false,
      type,
    };
    updateSchema([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    updateSchema(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const deleteField = (id: string) => {
    updateSchema(fields.filter((field) => field.id !== id));
  };

  const existingKeys = fields.map((f) => f.key);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      {/* Build Area - Left Side */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Form Builder</h3>
          <p className="text-sm text-muted-foreground">
            Drag components from the toolbar to build your form
          </p>
        </div>

        {fields.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                Drag components here to start building
              </p>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  onUpdate={updateField}
                  onDelete={deleteField}
                  existingKeys={existingKeys}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Toolbar - Right Side */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Components</h3>
          <p className="text-sm text-muted-foreground">
            Click to add to form
          </p>
        </div>

        <div className="space-y-3">
          {FIELD_TYPES.map((fieldType) => (
            <Card
              key={fieldType.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => addField(fieldType.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <fieldType.icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{fieldType.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {fieldType.type === "text" ? "Free text input" : "1-5 scale rating"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
