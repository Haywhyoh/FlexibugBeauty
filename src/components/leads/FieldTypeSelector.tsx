
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { FIELD_TYPES, FormField } from "@/types/form";

interface FieldTypeSelectorProps {
  onAddField: (type: FormField['type']) => void;
}

export const FieldTypeSelector = ({ onAddField }: FieldTypeSelectorProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Form Field</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {FIELD_TYPES.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              onClick={() => onAddField(type.value as FormField['type'])}
              className="h-auto p-4"
            >
              {type.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
