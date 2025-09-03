import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, AlertCircle, Clock, User, Stethoscope, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceRequirement {
  id: string;
  service_id: string;
  requirement_type: 'bring' | 'avoid' | 'prepare' | 'medical' | 'timing';
  title: string;
  description: string;
  is_mandatory: boolean;
  display_order: number;
}

interface ServiceRequirementsProps {
  serviceId: string;
  isEditable?: boolean;
  onRequirementsChange?: (requirements: ServiceRequirement[]) => void;
}

const requirementIcons = {
  bring: Package,
  avoid: AlertCircle,
  prepare: User,
  medical: Stethoscope,
  timing: Clock,
};

const requirementColors = {
  bring: "bg-blue-100 text-blue-800 border-blue-200",
  avoid: "bg-red-100 text-red-800 border-red-200", 
  prepare: "bg-green-100 text-green-800 border-green-200",
  medical: "bg-orange-100 text-orange-800 border-orange-200",
  timing: "bg-purple-100 text-purple-800 border-purple-200",
};

export const ServiceRequirements = ({ 
  serviceId, 
  isEditable = false, 
  onRequirementsChange 
}: ServiceRequirementsProps) => {
  const { toast } = useToast();
  const [requirements, setRequirements] = useState<ServiceRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newRequirement, setNewRequirement] = useState({
    type: 'prepare' as ServiceRequirement['requirement_type'],
    title: '',
    description: '',
    is_mandatory: false,
  });

  useEffect(() => {
    if (serviceId) {
      fetchRequirements();
    }
  }, [serviceId]);

  const fetchRequirements = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('service_requirements')
        .select('*')
        .eq('service_id', serviceId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setRequirements(data || []);
      onRequirementsChange?.(data || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRequirement = async () => {
    if (!newRequirement.title.trim() || !newRequirement.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and description",
        variant: "destructive",
      });
      return;
    }

    try {
      const maxOrder = Math.max(0, ...requirements.map(r => r.display_order));
      
      const { data, error } = await supabase
        .from('service_requirements')
        .insert({
          service_id: serviceId,
          requirement_type: newRequirement.type,
          title: newRequirement.title,
          description: newRequirement.description,
          is_mandatory: newRequirement.is_mandatory,
          display_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      const updatedRequirements = [...requirements, data];
      setRequirements(updatedRequirements);
      onRequirementsChange?.(updatedRequirements);
      
      setNewRequirement({
        type: 'prepare',
        title: '',
        description: '',
        is_mandatory: false,
      });
      setIsAdding(false);

      toast({
        title: "Success",
        description: "Requirement added successfully",
      });
    } catch (error) {
      console.error('Error adding requirement:', error);
      toast({
        title: "Error",
        description: "Failed to add requirement",
        variant: "destructive",
      });
    }
  };

  const deleteRequirement = async (requirementId: string) => {
    try {
      const { error } = await supabase
        .from('service_requirements')
        .delete()
        .eq('id', requirementId);

      if (error) throw error;

      const updatedRequirements = requirements.filter(r => r.id !== requirementId);
      setRequirements(updatedRequirements);
      onRequirementsChange?.(updatedRequirements);

      toast({
        title: "Success",
        description: "Requirement deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting requirement:', error);
      toast({
        title: "Error",
        description: "Failed to delete requirement",
        variant: "destructive",
      });
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'bring': return 'What to Bring';
      case 'avoid': return 'What to Avoid';
      case 'prepare': return 'Preparation';
      case 'medical': return 'Medical Info';
      case 'timing': return 'Timing';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      </div>
    );
  }

  const groupedRequirements = requirements.reduce((acc, req) => {
    if (!acc[req.requirement_type]) {
      acc[req.requirement_type] = [];
    }
    acc[req.requirement_type].push(req);
    return acc;
  }, {} as Record<string, ServiceRequirement[]>);

  return (
    <div className="space-y-4">
      {/* Display Requirements */}
      {requirements.length > 0 && (
        <div className="space-y-3">
          {Object.entries(groupedRequirements).map(([type, reqs]) => {
            const Icon = requirementIcons[type as keyof typeof requirementIcons];
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-sm text-gray-800">
                    {getTypeDisplayName(type)}
                  </h4>
                </div>
                <div className="space-y-2 ml-6">
                  {reqs.map((req) => (
                    <div key={req.id} className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-800">
                            {req.title}
                          </span>
                          {req.is_mandatory && (
                            <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {req.description}
                        </p>
                      </div>
                      {isEditable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                          onClick={() => deleteRequirement(req.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {requirements.length === 0 && !isEditable && (
        <p className="text-sm text-gray-500 text-center py-4">
          No specific requirements for this service
        </p>
      )}

      {/* Add New Requirement (Edit Mode Only) */}
      {isEditable && (
        <div className="border-t pt-4">
          {isAdding ? (
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add New Requirement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Type</label>
                    <Select 
                      value={newRequirement.type} 
                      onValueChange={(value: ServiceRequirement['requirement_type']) => 
                        setNewRequirement(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bring">What to Bring</SelectItem>
                        <SelectItem value="prepare">Preparation</SelectItem>
                        <SelectItem value="avoid">What to Avoid</SelectItem>
                        <SelectItem value="medical">Medical Info</SelectItem>
                        <SelectItem value="timing">Timing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Title</label>
                    <Input
                      value={newRequirement.title}
                      onChange={(e) => setNewRequirement(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief requirement title"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <Textarea
                    value={newRequirement.description}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the requirement"
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mandatory"
                    checked={newRequirement.is_mandatory}
                    onChange={(e) => setNewRequirement(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="mandatory" className="text-xs text-gray-700">
                    This is a mandatory requirement
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={addRequirement} className="text-xs">
                    Add Requirement
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setIsAdding(false);
                      setNewRequirement({
                        type: 'prepare',
                        title: '',
                        description: '',
                        is_mandatory: false,
                      });
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAdding(true)}
              className="w-full text-xs border-dashed"
            >
              <Plus className="w-3 h-3 mr-2" />
              Add Service Requirement
            </Button>
          )}
        </div>
      )}
    </div>
  );
};