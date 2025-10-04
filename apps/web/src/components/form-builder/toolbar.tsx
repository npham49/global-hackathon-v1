import { Card, CardContent } from "@/components/ui/card";
import { FIELD_TYPES } from "../../lib/constants/form-builder-constants";

interface ToolbarProps {
  onAddField: (type: "text" | "likert") => void;
}

export function Toolbar({ onAddField }: ToolbarProps) {
  return (
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
            onClick={() => onAddField(fieldType.type)}
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
  );
}
