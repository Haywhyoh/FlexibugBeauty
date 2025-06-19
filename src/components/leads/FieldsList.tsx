
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { FormField } from "@/types/form";
import { FieldConfigurator } from "./FieldConfigurator";
import { FieldTypeSelector } from "./FieldTypeSelector";

interface FieldsListProps {
  fields: FormField[];
  onAddField: (type: FormField['type']) => void;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
  onDeleteField: (id: string) => void;
  onMoveField: (id: string, direction: 'up' | 'down') => void;
  onPreview: () => void;
  onClearAllFields: () => void;
  canPreview: boolean;
}

export const FieldsList = ({
  fields,
  onAddField,
  onUpdateField,
  onDeleteField,
  onMoveField,
  onPreview,
  onClearAllFields,
  canPreview
}: FieldsListProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Form Fields</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={onPreview}
              variant="outline"
              disabled={!canPreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            {fields.length > 0 && (
              <Button 
                onClick={onClearAllFields}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Fields
              </Button>
            )}
            <FieldTypeSelector onAddField={onAddField} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No fields added yet. Click "Add Field" to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <FieldConfigurator
                key={field.id}
                field={field}
                index={index}
                totalFields={fields.length}
                onUpdate={onUpdateField}
                onDelete={onDeleteField}
                onMove={onMoveField}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
