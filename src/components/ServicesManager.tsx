import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, DollarSign, Clock, ChevronRight, ChevronLeft, Scissors, Palette, Sparkles } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_minutes: number | null;
  specialty_id: string | null;
  is_active: boolean | null;
  created_at: string;
}

interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

// Hierarchical service structure
interface ServiceTemplate {
  name: string;
  description: string;
  suggestedPrice: number;
  suggestedDuration: number; // in minutes
}

interface ServiceSubcategory {
  id: string;
  name: string;
  description: string;
  templates: ServiceTemplate[];
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: ServiceSubcategory[];
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "hair-stylist",
    name: "Hair Stylist",
    description: "Professional hair styling and care services",
    icon: "✂️",
    subcategories: [
      {
        id: "hair-service",
        name: "Hair Styling",
        description: "General hair styling and treatments",
        templates: [
          { name: "Ponytails", description: "Classic ponytail styling", suggestedPrice: 25, suggestedDuration: 30 },
          { name: "Braids", description: "Various braid styles", suggestedPrice: 45, suggestedDuration: 60 },
          { name: "Blowout", description: "Professional blow dry and style", suggestedPrice: 35, suggestedDuration: 45 },
          { name: "Updo", description: "Elegant updo styling", suggestedPrice: 60, suggestedDuration: 75 },
          { name: "Wash & Style", description: "Shampoo, condition, and style", suggestedPrice: 40, suggestedDuration: 60 },
          { name: "Hair Cut", description: "Professional hair cutting service", suggestedPrice: 50, suggestedDuration: 45 },
        ]
      },
      {
        id: "wig-service",
        name: "Wig Services",
        description: "Wig installation, styling, and maintenance",
        templates: [
          { name: "Wig Installation", description: "Professional wig installation", suggestedPrice: 80, suggestedDuration: 90 },
          { name: "Wig Styling", description: "Styling and customization of wigs", suggestedPrice: 50, suggestedDuration: 60 },
          { name: "Wig Maintenance", description: "Cleaning and maintenance service", suggestedPrice: 40, suggestedDuration: 45 },
          { name: "Wig Cut & Style", description: "Cutting and styling wig to preference", suggestedPrice: 65, suggestedDuration: 75 },
        ]
      },
      {
        id: "extensions",
        name: "Hair Extensions",
        description: "Various hair extension services",
        templates: [
          { name: "Tape-in Extensions", description: "Semi-permanent tape-in extensions", suggestedPrice: 120, suggestedDuration: 120 },
          { name: "Clip-in Extensions", description: "Temporary clip-in extensions", suggestedPrice: 30, suggestedDuration: 30 },
          { name: "Sew-in Extensions", description: "Long-lasting sew-in extensions", suggestedPrice: 150, suggestedDuration: 180 },
          { name: "Fusion Extensions", description: "Keratin fusion extensions", suggestedPrice: 200, suggestedDuration: 240 },
        ]
      }
    ]
  },
  {
    id: "makeup-artist",
    name: "Makeup Artist",
    description: "Professional makeup application services",
    icon: "💄",
    subcategories: [
      {
        id: "special-occasions",
        name: "Special Occasions",
        description: "Makeup for weddings, events, and special occasions",
        templates: [
          { name: "Bridal Makeup", description: "Complete bridal makeup with trial", suggestedPrice: 150, suggestedDuration: 90 },
          { name: "Prom Makeup", description: "Glamorous prom night makeup", suggestedPrice: 75, suggestedDuration: 60 },
          { name: "Party Makeup", description: "Party and event makeup", suggestedPrice: 60, suggestedDuration: 45 },
          { name: "Photoshoot Makeup", description: "Professional makeup for photos", suggestedPrice: 100, suggestedDuration: 75 },
        ]
      },
      {
        id: "everyday-makeup",
        name: "Everyday Makeup",
        description: "Natural and everyday makeup looks",
        templates: [
          { name: "Natural Makeup", description: "Subtle, everyday natural look", suggestedPrice: 40, suggestedDuration: 30 },
          { name: "Business Makeup", description: "Professional workplace makeup", suggestedPrice: 50, suggestedDuration: 40 },
          { name: "Date Night Makeup", description: "Romantic evening makeup", suggestedPrice: 55, suggestedDuration: 45 },
        ]
      }
    ]
  },
  {
    id: "nail-technician",
    name: "Nail Technician",
    description: "Professional nail care and design services",
    icon: "💅",
    subcategories: [
      {
        id: "manicure-services",
        name: "Manicure Services",
        description: "Professional manicure treatments",
        templates: [
          { name: "Classic Manicure", description: "Traditional manicure with polish", suggestedPrice: 25, suggestedDuration: 45 },
          { name: "Gel Manicure", description: "Long-lasting gel polish manicure", suggestedPrice: 40, suggestedDuration: 60 },
          { name: "French Manicure", description: "Classic French tip manicure", suggestedPrice: 35, suggestedDuration: 50 },
          { name: "Nail Art", description: "Custom nail art and designs", suggestedPrice: 50, suggestedDuration: 75 },
        ]
      },
      {
        id: "pedicure-services",
        name: "Pedicure Services",
        description: "Professional pedicure treatments",
        templates: [
          { name: "Classic Pedicure", description: "Traditional pedicure with polish", suggestedPrice: 35, suggestedDuration: 60 },
          { name: "Gel Pedicure", description: "Long-lasting gel polish pedicure", suggestedPrice: 50, suggestedDuration: 75 },
          { name: "Spa Pedicure", description: "Luxurious spa pedicure treatment", suggestedPrice: 65, suggestedDuration: 90 },
        ]
      }
    ]
  },
  {
    id: "skincare-specialist",
    name: "Skincare Specialist",
    description: "Professional skincare and facial treatments",
    icon: "✨",
    subcategories: [
      {
        id: "facial-treatments",
        name: "Facial Treatments",
        description: "Various facial and skincare treatments",
        templates: [
          { name: "Classic Facial", description: "Deep cleansing and moisturizing facial", suggestedPrice: 75, suggestedDuration: 60 },
          { name: "Anti-Aging Facial", description: "Anti-aging treatment with specialized products", suggestedPrice: 100, suggestedDuration: 75 },
          { name: "Acne Treatment", description: "Specialized treatment for acne-prone skin", suggestedPrice: 85, suggestedDuration: 60 },
          { name: "Hydrating Facial", description: "Deep moisturizing and hydration treatment", suggestedPrice: 80, suggestedDuration: 60 },
        ]
      }
    ]
  }
];

export const ServicesManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(1); // 1: Category, 2: Subcategory, 3: Template, 4: Details
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    specialty_id: '',
  });

  useEffect(() => {
    fetchSpecialties();
    fetchServices();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .order('name');

      if (error) throw error;
      setSpecialties(data || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          specialties(name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const createService = async () => {
    try {
      const { error } = await supabase
        .from('services')
        .insert({
          user_id: user?.id,
          name: newService.name,
          description: newService.description || null,
          price: newService.price ? parseFloat(newService.price) : null,
          duration_minutes: newService.duration_minutes ? parseInt(newService.duration_minutes) : null,
          specialty_id: newService.specialty_id || null,
          is_active: true,
        });

      if (error) throw error;

      resetCreationWizard();
      await fetchServices();
      
      toast({
        title: "Success",
        description: "Service created successfully",
      });
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchServices();
      
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchServices();
      
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  // Wizard helper functions
  const resetCreationWizard = () => {
    setIsCreating(false);
    setCreationStep(1);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedTemplate(null);
    setNewService({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      specialty_id: '',
    });
  };

  const startCreationWizard = () => {
    setIsCreating(true);
    setCreationStep(1);
  };

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setCreationStep(2);
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setCreationStep(3);
  };

  const handleTemplateSelect = (template: ServiceTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      setNewService({
        name: template.name,
        description: template.description,
        price: template.suggestedPrice.toString(),
        duration_minutes: template.suggestedDuration.toString(),
        specialty_id: '',
      });
    } else {
      // Custom service
      setNewService({
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
        specialty_id: '',
      });
    }
    setCreationStep(4);
  };

  const goBackStep = () => {
    if (creationStep > 1) {
      setCreationStep(creationStep - 1);
      if (creationStep === 2) {
        setSelectedCategory(null);
      } else if (creationStep === 3) {
        setSelectedSubcategory(null);
      } else if (creationStep === 4) {
        setSelectedTemplate(null);
      }
    }
  };

  // Group services by specialty
  const groupedServices = specialties.reduce((acc, specialty) => {
    const specialtyServices = services.filter(service => service.specialty_id === specialty.id);
    if (specialtyServices.length > 0) {
      acc[specialty.name] = specialtyServices;
    }
    return acc;
  }, {} as Record<string, Service[]>);

  // Add ungrouped services
  const ungroupedServices = services.filter(service => !service.specialty_id);
  if (ungroupedServices.length > 0) {
    groupedServices['Other Services'] = ungroupedServices;
  }

  // Calculate statistics
  const activeServices = services.filter(s => s.is_active);
  const averagePrice = activeServices.length > 0 
    ? activeServices.reduce((sum, s) => sum + (s.price || 0), 0) / activeServices.length 
    : 0;
  const averageDuration = activeServices.length > 0 
    ? activeServices.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / activeServices.length 
    : 0;

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="h-full w-full overflow-y-auto">
        <div className="w-full max-w-none px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between w-full">
            <div className="text-center sm:text-left min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-purple-800 leading-tight">
                Services & Pricing
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your service offerings and pricing</p>
            </div>
            <Button 
              onClick={startCreationWizard}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Service Creation Wizard */}
          {isCreating && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg border-l-4 border-l-purple-500 w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      {creationStep === 1 && "Choose Service Category"}
                      {creationStep === 2 && "Select Service Type"}
                      {creationStep === 3 && "Pick Specific Service"}
                      {creationStep === 4 && "Service Details"}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Step {creationStep} of 4
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetCreationWizard}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(creationStep / 4) * 100}%` }}
                  ></div>
                </div>
              </CardHeader>
              
              <CardContent className="w-full">
                {/* Step 1: Category Selection */}
                {creationStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">What type of beauty professional are you?</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {SERVICE_CATEGORIES.map((category) => (
                        <div
                          key={category.id}
                          onClick={() => handleCategorySelect(category)}
                          className="cursor-pointer group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="text-center">
                            <div className="text-4xl mb-3">{category.icon}</div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-2">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Subcategory Selection */}
                {creationStep === 2 && selectedCategory && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{selectedCategory.icon} {selectedCategory.name}</span>
                      <ChevronRight className="w-4 h-4" />
                      <span className="font-medium">Select service type</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedCategory.subcategories.map((subcategory) => (
                        <div
                          key={subcategory.id}
                          onClick={() => handleSubcategorySelect(subcategory)}
                          className="cursor-pointer group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-300"
                        >
                          <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors mb-2">
                            {subcategory.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {subcategory.description}
                          </p>
                          <div className="text-xs text-purple-600 mt-2">
                            {subcategory.templates.length} services available
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Template Selection */}
                {creationStep === 3 && selectedSubcategory && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{selectedCategory?.icon} {selectedCategory?.name}</span>
                      <ChevronRight className="w-4 h-4" />
                      <span>{selectedSubcategory.name}</span>
                      <ChevronRight className="w-4 h-4" />
                      <span className="font-medium">Pick service</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {selectedSubcategory.templates.map((template) => (
                        <div
                          key={template.name}
                          onClick={() => handleTemplateSelect(template)}
                          className="cursor-pointer group p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all duration-300"
                        >
                          <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors mb-2">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {template.description}
                          </p>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600 font-medium">
                              ${template.suggestedPrice}
                            </span>
                            <span className="text-gray-600">
                              {template.suggestedDuration} min
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Custom Service Option */}
                      <div
                        onClick={() => handleTemplateSelect(null)}
                        className="cursor-pointer group p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-400 hover:shadow-md transition-all duration-300"
                      >
                        <h3 className="font-semibold text-purple-600 mb-2">
                          ✨ Custom Service
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Create a unique service not listed above
                        </p>
                        <div className="text-sm text-purple-600">
                          Set your own pricing
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Service Details */}
                {creationStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <span>{selectedCategory?.icon} {selectedCategory?.name}</span>
                      <ChevronRight className="w-4 h-4" />
                      <span>{selectedSubcategory?.name}</span>
                      <ChevronRight className="w-4 h-4" />
                      <span className="font-medium">
                        {selectedTemplate ? selectedTemplate.name : "Custom Service"}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Service Name *</label>
                        <Input
                          value={newService.name}
                          onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter service name"
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                          value={newService.specialty_id}
                          onChange={(e) => setNewService(prev => ({ ...prev, specialty_id: e.target.value }))}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          <option value="">Select category</option>
                          {specialties.map((specialty) => (
                            <option key={specialty.id} value={specialty.id}>
                              {specialty.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Price ($) {selectedTemplate && <span className="text-xs text-gray-500">Suggested: ${selectedTemplate.suggestedPrice}</span>}
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newService.price}
                          onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Duration (minutes) {selectedTemplate && <span className="text-xs text-gray-500">Suggested: {selectedTemplate.suggestedDuration}min</span>}
                        </label>
                        <Input
                          type="number"
                          value={newService.duration_minutes}
                          onChange={(e) => setNewService(prev => ({ ...prev, duration_minutes: e.target.value }))}
                          placeholder="60"
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea
                        value={newService.description}
                        onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your service..."
                        rows={3}
                        className="w-full resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <div>
                    {creationStep > 1 && (
                      <Button variant="outline" onClick={goBackStep}>
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetCreationWizard}>
                      Cancel
                    </Button>
                    
                    {creationStep === 4 && (
                      <Button 
                        onClick={createService}
                        disabled={!newService.name}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Create Service
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services List */}
          {services.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-purple-300 hover:border-purple-400 transition-colors w-full">
              <CardContent className="p-6 lg:p-8 text-center w-full">
                <DollarSign className="w-12 h-12 lg:w-16 lg:h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">No services yet</h3>
                <p className="text-gray-600 mb-4 lg:mb-6 text-sm sm:text-base">
                  Start by adding your first service offering
                </p>
                <Button 
                  onClick={startCreationWizard}
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Services by Category */}
              {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
                <div key={categoryName} className="space-y-4 w-full">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    {categoryName}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 w-full">
                    {categoryServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        specialties={specialties}
                        onUpdate={updateService}
                        onDelete={deleteService}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Service Statistics */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Service Performance</CardTitle>
                </CardHeader>
                <CardContent className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 w-full">
                      <div className="text-2xl font-bold text-purple-600">{activeServices.length}</div>
                      <div className="text-sm text-gray-600">Active Services</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 w-full">
                      <div className="text-2xl font-bold text-green-600">
                        ${averagePrice > 0 ? averagePrice.toFixed(0) : '0'}
                      </div>
                      <div className="text-sm text-gray-600">Average Service Value</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200 w-full">
                      <div className="text-2xl font-bold text-blue-600">
                        {averageDuration > 0 ? `${(averageDuration / 60).toFixed(1)}h` : '0h'}
                      </div>
                      <div className="text-sm text-gray-600">Average Service Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  service: Service;
  specialties: Specialty[];
  onUpdate: (id: string, updates: Partial<Service>) => void;
  onDelete: (id: string) => void;
}

const ServiceCard = ({ service, specialties, onUpdate, onDelete }: ServiceCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || '');
  const [price, setPrice] = useState(service.price?.toString() || '');
  const [durationMinutes, setDurationMinutes] = useState(service.duration_minutes?.toString() || '');
  const [specialtyId, setSpecialtyId] = useState(service.specialty_id || '');

  const handleSave = () => {
    onUpdate(service.id, {
      name,
      description: description || null,
      price: price ? parseFloat(price) : null,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      specialty_id: specialtyId || null,
    });
    setIsEditing(false);
  };

  const toggleActive = () => {
    onUpdate(service.id, { is_active: !service.is_active });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Not set';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className={`bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-lg border-0 shadow-md w-full overflow-hidden ${
      !service.is_active ? 'opacity-60' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-start justify-between w-full">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight">{service.name}</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
              {service.duration_minutes && (
                <div className="flex items-center gap-1 text-purple-600">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{formatDuration(service.duration_minutes)}</span>
                </div>
              )}
              {service.price && (
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">${service.price}</span>
                </div>
              )}
            </div>
          </div>
          <Badge variant={service.is_active ? "default" : "secondary"} className="text-xs flex-shrink-0">
            {service.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 w-full">
        {isEditing ? (
          <div className="space-y-3 w-full">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Service name"
              className="w-full text-sm"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full text-sm resize-none"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="w-full text-sm"
              />
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Minutes"
                className="w-full text-sm"
              />
            </div>
            <select
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="">Select category</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button size="sm" onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex-1">
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="text-xs flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {service.description && (
              <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">{service.description}</p>
            )}
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center w-full">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="text-xs w-full sm:w-auto">
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs w-full sm:w-auto" 
                  onClick={() => onDelete(service.id)}
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Delete
                </Button>
              </div>
              <Button
                size="sm"
                variant={service.is_active ? "default" : "outline"}
                onClick={toggleActive}
                className={`text-xs w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0 ${service.is_active ? "bg-green-600 hover:bg-green-700" : ""}`}
              >
                {service.is_active ? "Active" : "Inactive"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
