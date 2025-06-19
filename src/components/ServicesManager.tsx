import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X, DollarSign, Clock } from "lucide-react";

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

export const ServicesManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isCreating, setIsCreating] = useState(false);
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

      setNewService({
        name: '',
        description: '',
        price: '',
        duration_minutes: '',
        specialty_id: '',
      });
      setIsCreating(false);
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
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                Services & Pricing
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your service offerings and pricing</p>
            </div>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Create Service Form */}
          {isCreating && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg border-l-4 border-l-purple-500 w-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  Create New Service
                  <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
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
                      placeholder="e.g., Classic Lash Set"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="w-full">
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

                  <div className="flex items-center gap-2 w-full">
                    <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newService.price}
                        onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="120.00"
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
                        placeholder="120"
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

                <div className="flex flex-col sm:flex-row gap-2 justify-end w-full">
                  <Button variant="outline" onClick={() => setIsCreating(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button 
                    onClick={createService}
                    disabled={!newService.name}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Service
                  </Button>
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
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
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 w-full">
                      <div className="text-2xl font-bold text-purple-600">{activeServices.length}</div>
                      <div className="text-sm text-gray-600">Active Services</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 w-full">
                      <div className="text-2xl font-bold text-green-600">
                        ${averagePrice > 0 ? averagePrice.toFixed(0) : '0'}
                      </div>
                      <div className="text-sm text-gray-600">Average Service Value</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 w-full">
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
              <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs flex-1">
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
