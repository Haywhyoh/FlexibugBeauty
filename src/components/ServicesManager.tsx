import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useServiceUpload } from "@/hooks/useServiceUpload";
import { ServiceRequirements } from "@/components/ServiceRequirements";
import { Plus, Edit, Trash2, Save, X, DollarSign, Clock, MoreVertical, Eye, Upload, Image, Search, Filter, Settings, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_minutes: number | null;
  specialty_id: string | null;
  is_active: boolean | null;
  image_url: string | null;
  client_instructions: string | null;
  preparation_time: number | null;
  service_notes: string | null;
  requires_consultation: boolean | null;
  cancellation_policy: string | null;
  complexity_level: string | null;
  created_at: string;
}

interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

// Simple category structure
const SERVICE_CATEGORIES = [
  {
    name: "Hair Services",
    subcategories: ["Cut & Style", "Coloring", "Extensions", "Braids & Protective Styles", "Wigs", "Treatments", "Other Hair Services"]
  },
  {
    name: "Makeup Services", 
    subcategories: ["Bridal Makeup", "Special Event", "Everyday Makeup", "Editorial/Photoshoot", "Lessons/Consultation", "Other Makeup Services"]
  },
  {
    name: "Nail Services",
    subcategories: ["Manicures", "Pedicures", "Nail Art", "Gel/Shellac", "Extensions/Enhancements", "Other Nail Services"]
  },
  {
    name: "Skincare Services",
    subcategories: ["Facials", "Chemical Peels", "Microdermabrasion", "Anti-Aging Treatments", "Acne Treatments", "Other Skincare Services"]
  },
  {
    name: "Lash Services",
    subcategories: ["Classic Lashes", "Volume Lashes", "Lash Lifts", "Lash Tinting", "Lash Removal", "Other Lash Services"]
  },
  {
    name: "Eyebrow Services",
    subcategories: ["Brow Shaping", "Brow Tinting", "Microblading", "Brow Lamination", "Henna Brows", "Other Brow Services"]
  },
  {
    name: "Body Services",
    subcategories: ["Massage", "Body Treatments", "Waxing", "Spray Tanning", "Body Wraps", "Other Body Services"]
  },
  {
    name: "Other Services",
    subcategories: ["Custom Service"]
  }
];

export const ServicesManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    specialty_id: '',
    category: '',
    subcategory: '',
    client_instructions: '',
    preparation_time: '',
    service_notes: '',
    requires_consultation: false,
    cancellation_policy: '',
    complexity_level: 'basic',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  const { uploadServiceImage, deleteServiceImage } = useServiceUpload(() => {
    fetchServices();
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
      let imageUrl = null;
      if (selectedFile) {
        imageUrl = await uploadServiceImage(selectedFile);
      }

      const serviceData: any = {
        user_id: user?.id,
        name: newService.name,
        description: newService.description || null,
        price: newService.price ? parseFloat(newService.price) : null,
        duration_minutes: newService.duration_minutes ? parseInt(newService.duration_minutes) : null,
        specialty_id: newService.specialty_id || null,
        is_active: true,
        image_url: imageUrl,
        client_instructions: newService.client_instructions || null,
        preparation_time: newService.preparation_time ? parseInt(newService.preparation_time) : null,
        service_notes: newService.service_notes || null,
        requires_consultation: newService.requires_consultation,
        cancellation_policy: newService.cancellation_policy || null,
        complexity_level: newService.complexity_level,
      };

      const { error } = await supabase
        .from('services')
        .insert(serviceData);

      if (error) throw error;

      resetServiceForm();
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

  const updateService = async (id: string, updates: Partial<Service>, newImage?: File) => {
    try {
      let imageUrl = updates.image_url;
      
      if (newImage) {
        imageUrl = await uploadServiceImage(newImage);
      }

      const updateData: any = {
        ...updates,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('services')
        .update(updateData)
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
      // Find the service to get its image URL
      const service = services.find(s => s.id === id);
      
      // Delete the image from storage if it exists
      if (service?.image_url) {
        await deleteServiceImage(service.image_url);
      }

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

  // Form helper functions
  const resetServiceForm = () => {
    setIsCreating(false);
    setSelectedMainCategory('');
    setSelectedSubcategory('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowAdvancedSettings(false);
    setNewService({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      specialty_id: '',
      category: '',
      subcategory: '',
      client_instructions: '',
      preparation_time: '',
      service_notes: '',
      requires_consultation: false,
      cancellation_policy: '',
      complexity_level: 'basic',
    });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedMainCategory(category);
    setSelectedSubcategory(''); // Reset subcategory when main category changes
    setNewService(prev => ({ ...prev, category, subcategory: '' }));
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setNewService(prev => ({ ...prev, subcategory }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };


  // Filter services based on category and search
  const filteredServices = services.filter(service => {
    // Category filter
    const categoryMatch = selectedCategoryFilter === 'All' || 
      (service.specialty_id && specialties.find(s => s.id === service.specialty_id)?.name === selectedCategoryFilter) ||
      (!service.specialty_id && selectedCategoryFilter === 'Other Services');
    
    // Search filter
    const searchMatch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && searchMatch;
  });

  // Get unique categories for filter dropdown
  const categoryOptions = ['All', ...specialties.map(s => s.name), 'Other Services'];

  // Calculate statistics based on filtered services
  const activeFilteredServices = filteredServices.filter(s => s.is_active);
  const averagePrice = activeFilteredServices.length > 0 
    ? activeFilteredServices.reduce((sum, s) => sum + (s.price || 0), 0) / activeFilteredServices.length 
    : 0;
  const averageDuration = activeFilteredServices.length > 0 
    ? activeFilteredServices.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / activeFilteredServices.length 
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
              onClick={() => setIsCreating(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Simple Service Creation Form */}
          {isCreating && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg border-l-4 border-l-purple-500 w-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  Add New Service
                  <Button variant="ghost" size="sm" onClick={resetServiceForm}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-2">Service Name *</label>
                    <Input
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Brazilian Blowout, Bridal Makeup"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="w-full">
                    <label className="block text-sm font-medium mb-2">Main Category</label>
                    <select
                      value={selectedMainCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="">Select main category</option>
                      {SERVICE_CATEGORIES.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedMainCategory && (
                    <div className="w-full">
                      <label className="block text-sm font-medium mb-2">Subcategory</label>
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                      >
                        <option value="">Select subcategory</option>
                        {SERVICE_CATEGORIES.find(cat => cat.name === selectedMainCategory)?.subcategories.map((subcategory) => (
                          <option key={subcategory} value={subcategory}>
                            {subcategory}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  

                  <div className="flex items-center gap-2 w-full">
                    <span className="text-green-600 font-bold text-lg flex-shrink-0">₦</span>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium mb-2">Price (₦)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newService.price}
                        onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full">
                    <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                      <Input
                        type="number"
                        value={newService.duration_minutes}
                        onChange={(e) => setNewService(prev => ({ ...prev, duration_minutes: e.target.value }))}
                        placeholder="60"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>


                <div className="w-full">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your service..."
                    rows={3}
                    className="w-full resize-none"
                  />
                </div>

                {/* Image Upload Input */}
                <div className="w-full">
                  <label className="block text-sm font-medium mb-2">Service Image (Optional)</label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {previewUrl && (
                      <div className="mt-3">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Instructions */}
                <div className="w-full">
                  <label className="block text-sm font-medium mb-2">
                    Client Instructions (What should clients bring/know?)
                  </label>
                  <Textarea
                    value={newService.client_instructions}
                    onChange={(e) => setNewService(prev => ({ ...prev, client_instructions: e.target.value }))}
                    placeholder="e.g., Bring clean hair, no makeup, arrive 15 minutes early..."
                    rows={3}
                    className="w-full resize-none"
                  />
                </div>

                {/* Advanced Settings Toggle */}
                <div className="w-full border-t pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="w-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700"
                  >
                    <Settings className="w-4 h-4" />
                    Advanced Settings
                    {showAdvancedSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Advanced Settings Section */}
                {showAdvancedSettings && (
                  <div className="w-full space-y-4 bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Preparation Time (minutes)</label>
                        <Input
                          type="number"
                          value={newService.preparation_time}
                          onChange={(e) => setNewService(prev => ({ ...prev, preparation_time: e.target.value }))}
                          placeholder="15"
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Time needed to prepare before service starts</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Service Complexity</label>
                        <select
                          value={newService.complexity_level}
                          onChange={(e) => setNewService(prev => ({ ...prev, complexity_level: e.target.value }))}
                          className="w-full p-2 border rounded-md text-sm"
                        >
                          <option value="basic">Basic</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="requires_consultation"
                        checked={newService.requires_consultation}
                        onChange={(e) => setNewService(prev => ({ ...prev, requires_consultation: e.target.checked }))}
                        className="rounded"
                      />
                      <label htmlFor="requires_consultation" className="text-sm text-gray-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Requires consultation before booking
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Internal Service Notes</label>
                      <Textarea
                        value={newService.service_notes}
                        onChange={(e) => setNewService(prev => ({ ...prev, service_notes: e.target.value }))}
                        placeholder="Internal notes for your reference (not visible to clients)..."
                        rows={2}
                        className="w-full resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Cancellation Policy</label>
                      <Textarea
                        value={newService.cancellation_policy}
                        onChange={(e) => setNewService(prev => ({ ...prev, cancellation_policy: e.target.value }))}
                        placeholder="e.g., 24-hour cancellation required, 50% charge for same-day cancellation..."
                        rows={2}
                        className="w-full resize-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 justify-end w-full">
                  <Button variant="outline" onClick={resetServiceForm} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button 
                    onClick={createService}
                    disabled={!newService.name}
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Controls */}
          {services.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter:</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {/* Category Filter */}
                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 text-sm"
                      />
                    </div>

                    {/* Clear Filters */}
                    {(selectedCategoryFilter !== 'All' || searchQuery !== '') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategoryFilter('All');
                          setSearchQuery('');
                        }}
                        className="text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {/* Results Count */}
                  <div className="text-sm text-gray-500">
                    {filteredServices.length} of {services.length} services
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
                  onClick={() => setIsCreating(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : filteredServices.length === 0 && (selectedCategoryFilter !== 'All' || searchQuery !== '') ? (
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 w-full">
              <CardContent className="p-6 lg:p-8 text-center w-full">
                <Search className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">No services found</h3>
                <p className="text-gray-600 mb-4 lg:mb-6 text-sm sm:text-base">
                  No services match your current filters. Try adjusting your search or category filter.
                </p>
                <Button 
                  onClick={() => {
                    setSelectedCategoryFilter('All');
                    setSearchQuery('');
                  }}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile Card Layout (default) */}
              <div className="block md:hidden space-y-3 w-full">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    specialties={specialties}
                    onUpdate={updateService}
                    onDelete={deleteService}
                    isMobile={true}
                  />
                ))}
              </div>

              {/* Desktop Table Layout */}
              <Card className="hidden md:block bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full overflow-hidden">
                <CardContent className="p-0">
                  {/* Table Header */}
                  <div className="bg-purple-50 border-b border-purple-100 p-4 grid grid-cols-12 gap-4 text-sm font-medium text-purple-800">
                    <div className="col-span-1">Image</div>
                    <div className="col-span-3">Service Name</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-1">Price</div>
                    <div className="col-span-2">Duration</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                  
                  {/* Table Body */}
                  <div className="divide-y divide-gray-100">
                    {filteredServices.map((service, index) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        specialties={specialties}
                        onUpdate={updateService}
                        onDelete={deleteService}
                        isEvenRow={index % 2 === 0}
                        isMobile={false}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Service Statistics */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Service Performance</CardTitle>
                </CardHeader>
                <CardContent className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200 w-full">
                      <div className="text-2xl font-bold text-purple-600">{activeFilteredServices.length}</div>
                      <div className="text-sm text-gray-600">Active Services{selectedCategoryFilter !== 'All' || searchQuery !== '' ? ' (Filtered)' : ''}</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200 w-full">
                      <div className="text-2xl font-bold text-green-600">
                        ₦{averagePrice > 0 ? averagePrice.toFixed(0) : '0'}
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
  onUpdate: (id: string, updates: Partial<Service>, newImage?: File) => void;
  onDelete: (id: string) => void;
  isEvenRow?: boolean;
  isMobile?: boolean;
}

const ServiceCard = ({ service, specialties, onUpdate, onDelete, isEvenRow = false, isMobile = false }: ServiceCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || '');
  const [price, setPrice] = useState(service.price?.toString() || '');
  const [durationMinutes, setDurationMinutes] = useState(service.duration_minutes?.toString() || '');
  const [specialtyId, setSpecialtyId] = useState(service.specialty_id || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSave = () => {
    onUpdate(service.id, {
      name,
      description: description || null,
      price: price ? parseFloat(price) : null,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      specialty_id: specialtyId || null,
    }, selectedImage || undefined);
    setIsEditing(false);
    setSelectedImage(null);
    setImagePreview(null);
  };


  const toggleActive = () => {
    onUpdate(service.id, { is_active: !service.is_active });
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
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

  if (isMobile) {
    // Mobile Card Layout
    return (
      <Card className={`bg-white/90 backdrop-blur-sm border border-gray-200 transition-all duration-200 hover:shadow-md w-full ${
        !service.is_active ? 'opacity-60' : ''
      }`}>
        <CardContent className="p-4">
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
              
              
              <div className="grid grid-cols-2 gap-2 w-full">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold text-xs">₦</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-sm pl-7"
                  />
                </div>
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
              
              {/* Image Upload for Edit - Mobile */}
              <div className="w-full">
                <label className="block text-sm font-medium mb-2">Update Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {imagePreview && (
                  <div className="flex justify-center mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2 w-full">
                <Button size="sm" onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Mobile Service Display */}
              <div className="flex items-start gap-3">
                {/* Service Image */}
                <div className="flex-shrink-0">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center border border-purple-200">
                      <Image className="w-6 h-6 text-purple-400" />
                    </div>
                  )}
                </div>
                
                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 leading-tight">{service.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsViewing(true)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Service
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={toggleActive}>
                          {service.is_active ? (
                            <>
                              <X className="w-4 h-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(service.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Category Badge */}
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-purple-100 text-purple-700 border-purple-200 mb-2"
                  >
                    {service.specialty_id 
                      ? specialties.find(s => s.id === service.specialty_id)?.name || 'Other Services'
                      : 'Other Services'
                    }
                  </Badge>
                  
                  {/* Price and Duration */}
                  <div className="flex items-center gap-4 text-sm mb-2">
                    {service.price && (
                      <div className="flex items-center gap-1 text-green-600">
                        <span className="font-bold">₦</span>
                        <span className="font-semibold">{service.price}</span>
                      </div>
                    )}
                    {service.duration_minutes && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(service.duration_minutes)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status */}
                  <Badge 
                    variant={service.is_active ? "default" : "secondary"}
                    className={`text-xs ${
                      service.is_active 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              
              {/* Description */}
              {service.description && (
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              )}
            </div>
          )}
          
          {/* View Details Dialog */}
          <Dialog open={isViewing} onOpenChange={setIsViewing}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{service.name}</DialogTitle>
                <DialogDescription>Service details and information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-48 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <p className="text-green-600 font-semibold">
                      {service.price ? `₦${service.price}` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <p className="text-purple-600">{formatDuration(service.duration_minutes)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                {service.description && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Description:</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  // Desktop Table Layout
  return (
    <div className={`transition-all duration-200 hover:bg-gray-50 p-4 w-full ${
      isEvenRow ? 'bg-gray-50/30' : 'bg-white'
    } ${
      !service.is_active ? 'opacity-60' : ''
    }`}>
      {isEditing ? (
        <div className="col-span-12 space-y-3 w-full bg-gray-50 p-4 rounded-lg border">
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
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-bold">₦</span>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full text-sm pl-8"
              />
            </div>
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
          
          {/* Image Upload for Edit - Desktop */}
          <div className="w-full">
            <label className="block text-sm font-medium mb-2">Update Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              </div>
            )}
          </div>
          
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
        <div className="grid grid-cols-12 gap-4 items-center w-full">
          
          {/* Service Image */}
          <div className="col-span-1">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center border border-purple-200">
                <Image className="w-4 h-4 text-purple-400" />
              </div>
            )}
          </div>
          
          {/* Service Name */}
          <div className="col-span-3">
            <h3 className="text-base font-semibold text-gray-800 truncate">{service.name}</h3>
            {service.description && (
              <p className="text-gray-600 text-sm truncate mt-1">{service.description}</p>
            )}
          </div>
          
          {/* Category */}
          <div className="col-span-2">
            <Badge 
              variant="secondary" 
              className="text-xs bg-purple-100 text-purple-700 border-purple-200"
            >
              {service.specialty_id 
                ? specialties.find(s => s.id === service.specialty_id)?.name || 'Other Services'
                : 'Other Services'
              }
            </Badge>
          </div>
          
          {/* Price */}
          <div className="col-span-1">
            {service.price ? (
              <div className="flex items-center text-green-600">
                <span className="font-bold text-sm">₦</span>
                <span className="font-semibold text-sm">{service.price}</span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">-</span>
            )}
          </div>
          
          {/* Duration */}
          <div className="col-span-2">
            {service.duration_minutes ? (
              <div className="flex items-center gap-1 text-purple-600">
                <Clock className="w-3 h-3" />
                <span className="text-sm">{formatDuration(service.duration_minutes)}</span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">-</span>
            )}
          </div>
          
          {/* Status */}
          <div className="col-span-2">
            <Badge 
              variant={service.is_active ? "default" : "secondary"}
              className={`text-xs ${
                service.is_active 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {service.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          {/* Actions */}
          <div className="col-span-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsViewing(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Service
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleActive}>
                  {service.is_active ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Deactivate Service
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Activate Service
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(service.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* View Details Dialog */}
          <Dialog open={isViewing} onOpenChange={setIsViewing}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{service.name}</DialogTitle>
                <DialogDescription>Service details and information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-48 rounded-lg object-cover border border-gray-200"
                  />
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Price:</span>
                    <p className="text-green-600 font-semibold">
                      {service.price ? `₦${service.price}` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <p className="text-purple-600">{formatDuration(service.duration_minutes)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                {service.description && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Description:</span>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};
