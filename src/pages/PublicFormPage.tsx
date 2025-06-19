import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from "lucide-react";
import { FormField } from '@/types/form';

interface LeadForm {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  branding: any;
  professional_id: string;
  is_active: boolean;
}

const PublicFormPage = () => {
  const { formId } = useParams();
  const { toast } = useToast();
  const [form, setForm] = useState<LeadForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    if (!formId) return;

    try {
      const { data, error } = await supabase
        .from('lead_forms')
        .select('*')
        .eq('id', formId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      // Transform the data to match our interface with proper type casting through unknown
      const transformedForm: LeadForm = {
        id: data.id,
        title: data.title,
        description: data.description,
        fields: Array.isArray(data.fields) ? (data.fields as unknown as FormField[]) : [],
        branding: typeof data.branding === 'object' ? data.branding : {},
        professional_id: data.professional_id,
        is_active: data.is_active
      };
      
      setForm(transformedForm);
    } catch (error) {
      console.error('Error fetching form:', error);
      toast({
        title: "Error",
        description: "Form not found or no longer active",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    // Validate required fields
    const missingFields = form.fields
      .filter(field => field.required && !formData[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('submit-lead-form', {
        body: {
          formId: form.id,
          professionalId: form.professional_id,
          data: formData
        }
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Your submission has been received."
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <span>{field.label}</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-gray-600">This form is no longer available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-gray-600">Your submission has been received. We'll get back to you soon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle 
              className="text-2xl"
              style={{ color: form.branding?.primaryColor || '#8b5cf6' }}
            >
              {form.title}
            </CardTitle>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field) => (
                <div key={field.id}>
                  {field.type !== 'checkbox' && (
                    <Label className="block mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                  )}
                  {renderField(field)}
                </div>
              ))}
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full"
                style={{ 
                  backgroundColor: form.branding?.primaryColor || '#8b5cf6',
                  borderColor: form.branding?.primaryColor || '#8b5cf6'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicFormPage;
