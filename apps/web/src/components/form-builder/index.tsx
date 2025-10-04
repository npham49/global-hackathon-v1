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
import { FormField, FormBuilderProps } from "../../types/form-builder-types";
import { SortableField } from "./sortable-field";
import { Toolbar } from "./toolbar";

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
      <Toolbar onAddField={addField} />
    </div>
  );
}
