
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { FormField, FormTemplateData } from "@/types/form";
import { FormSettings } from "./FormSettings";
import { FieldsList } from "./FieldsList";
import { FormPreviewModal } from "./FormPreviewModal";

interface LeadFormBuilderProps {
  onSave: (formData: any) => Promise<any>;
  templateData?: FormTemplateData;
}

export const LeadFormBuilder = ({ onSave, templateData }: LeadFormBuilderProps) => {
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load template data when provided
  useEffect(() => {
    if (templateData) {
      setFormTitle(templateData.title || '');
      setFormDescription(templateData.description || '');
      if (templateData.fields) {
        // Generate new IDs for template fields to avoid conflicts
        const fieldsWithNewIds = templateData.fields.map(field => ({
          ...field,
          id: `field_${Date.now()}_${Math.random()}`
        }));
        setFields(fieldsWithNewIds);
      }
    }
  }, [templateData]);

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      placeholder: type === 'email' ? 'Enter your email' : `Enter ${type}`,
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const clearAllFields = () => {
    if (window.confirm('Are you sure you want to clear all fields? This action cannot be undone.')) {
      setFields([]);
    }
  };

  const moveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(field => field.id === id);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < fields.length - 1)
    ) {
      const newFields = [...fields];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
      setFields(newFields);
    }
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a form title');
      return;
    }

    setSaving(true);
    try {
      const formData = {
        title: formTitle,
        description: formDescription,
        fields: fields,
        branding: {
          primaryColor: '#8b5cf6',
          logo: null
        }
      };

      await onSave(formData);
      
      // Reset form
      setFormTitle('');
      setFormDescription('');
      setFields([]);
    } finally {
      setSaving(false);
    }
  };

  const previewForm = {
    id: 'preview',
    title: formTitle || 'Form Preview',
    description: formDescription,
    fields: fields,
    branding: { primaryColor: '#8b5cf6' }
  };

  const canPreview = formTitle.trim() && fields.length > 0;
  const canSave = formTitle.trim() && fields.length > 0;

  return (
    <div className="space-y-6">
      <FormSettings
        title={formTitle}
        description={formDescription}
        onTitleChange={setFormTitle}
        onDescriptionChange={setFormDescription}
      />

      <FieldsList
        fields={fields}
        onAddField={addField}
        onUpdateField={updateField}
        onDeleteField={deleteField}
        onMoveField={moveField}
        onPreview={() => setShowPreview(true)}
        onClearAllFields={clearAllFields}
        canPreview={canPreview}
      />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Form'}
        </Button>
      </div>

      {/* Preview Modal */}
      <FormPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        form={previewForm}
      />
    </div>
  );
};
