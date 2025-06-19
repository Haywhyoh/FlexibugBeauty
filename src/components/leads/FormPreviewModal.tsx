
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    id: string;
    title: string;
    description?: string;
    fields: FormField[];
    branding: any;
  } | null;
}

export const FormPreviewModal = ({ isOpen, onClose, form }: FormPreviewModalProps) => {
  const { toast } = useToast();

  const formUrl = form ? `${window.location.origin}/form/${form.id}` : '';
  const embedCode = form ? `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>` : '';

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`
    });
  };

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            placeholder={field.placeholder}
            type={field.type}
            disabled
          />
        );
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            disabled
          />
        );
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox disabled />
            <span>{field.label}</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (!form) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Form Preview & Share</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="border rounded-lg p-6 bg-gray-50">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{ color: form.branding?.primaryColor || '#8b5cf6' }}
                >
                  {form.title}
                </h2>
                {form.description && (
                  <p className="text-gray-600 mb-6">{form.description}</p>
                )}
                
                <div className="space-y-4">
                  {form.fields.map((field) => (
                    <div key={field.id}>
                      {field.type !== 'checkbox' && (
                        <Label className="block mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      )}
                      {renderFieldPreview(field)}
                    </div>
                  ))}
                  <Button 
                    className="w-full"
                    disabled
                    style={{ 
                      backgroundColor: form.branding?.primaryColor || '#8b5cf6',
                      borderColor: form.branding?.primaryColor || '#8b5cf6'
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Share Form</h3>
            
            <div className="space-y-4">
              {/* Direct Link */}
              <div>
                <Label className="block mb-2">Direct Link</Label>
                <div className="flex gap-2">
                  <Input value={formUrl} readOnly className="flex-1" />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(formUrl, 'Link')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(formUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Embed Code */}
              <div>
                <Label className="block mb-2">Embed Code</Label>
                <div className="relative">
                  <Textarea 
                    value={embedCode} 
                    readOnly 
                    className="font-mono text-sm"
                    rows={3}
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(embedCode, 'Embed code')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Copy this code and paste it into your website where you want the form to appear.
                </p>
              </div>

              {/* QR Code placeholder */}
              <div>
                <Label className="block mb-2">QR Code</Label>
                <div className="border rounded-lg p-4 text-center bg-gray-50">
                  <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center">
                    <span className="text-gray-400 text-sm">QR Code</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    QR code generation coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
