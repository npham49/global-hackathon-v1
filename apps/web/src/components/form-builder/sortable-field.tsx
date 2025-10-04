import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormField } from "../../types/form-builder-types";
import { generateKey } from "../../lib/utils/form-builder-utils";

interface SortableFieldProps {
  field: FormField;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDelete: (id: string) => void;
  existingKeys: string[];
}

export function SortableField({
  field,
  onUpdate,
  onDelete,
  existingKeys,
}: SortableFieldProps) {
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
