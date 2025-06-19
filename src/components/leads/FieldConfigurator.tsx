
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, GripVertical } from "lucide-react";
import { FormField } from "@/types/form";

interface FieldConfiguratorProps {
  field: FormField;
  index: number;
  totalFields: number;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export const FieldConfigurator = ({
  field,
  index,
  totalFields,
  onUpdate,
  onDelete,
  onMove
}: FieldConfiguratorProps) => {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMove(field.id, 'up')}
              disabled={index === 0}
            >
              ↑
            </Button>
            <GripVertical className="w-4 h-4 text-gray-400" />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMove(field.id, 'down')}
              disabled={index === totalFields - 1}
            >
              ↓
            </Button>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{field.type}</Badge>
              <Input
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                placeholder="Field label"
                className="flex-1"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                />
                Required
              </label>
            </div>
            
            <Input
              value={field.placeholder || ''}
              onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
              placeholder="Placeholder text"
            />
            
            {field.type === 'select' && (
              <div>
                <Label>Options (one per line)</Label>
                <Textarea
                  value={field.options?.join('\n') || ''}
                  onChange={(e) => onUpdate(field.id, { 
                    options: e.target.value.split('\n').filter(o => o.trim()) 
                  })}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
            )}
          </div>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(field.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
