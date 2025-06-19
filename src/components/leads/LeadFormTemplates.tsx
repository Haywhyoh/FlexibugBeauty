
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Copy, Eye } from "lucide-react";
import { useFormTemplates } from "@/hooks/useFormTemplates";

interface LeadFormTemplatesProps {
  onUseTemplate: (template: any) => void;
  onPreviewTemplate: (template: any) => void;
}

export const LeadFormTemplates = ({ onUseTemplate, onPreviewTemplate }: LeadFormTemplatesProps) => {
  const { templates, loading } = useFormTemplates();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Form Templates</h3>
        <Badge variant="secondary">{templates.length} templates</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-base">{template.name}</CardTitle>
                </div>
                {template.is_system_template && (
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>
              {template.description && (
                <p className="text-sm text-gray-600">{template.description}</p>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={template.template_type === 'enquiry' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {template.template_type === 'enquiry' ? 'Enquiry' : 'Appointment Request'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {template.fields.length} fields
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onPreviewTemplate(template)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onUseTemplate(template)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
