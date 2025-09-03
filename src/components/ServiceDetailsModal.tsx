import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceRequirements } from "@/components/ServiceRequirements";
import { Clock, DollarSign, Calendar, AlertCircle, User, Settings } from "lucide-react";

interface ServiceDetailsModalProps {
  service: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    duration_minutes: number | null;
    image_url: string | null;
    client_instructions: string | null;
    preparation_time: number | null;
    requires_consultation: boolean | null;
    complexity_level: string | null;
    cancellation_policy: string | null;
    specialties: { name: string } | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow?: () => void;
}

export const ServiceDetailsModal = ({ 
  service, 
  isOpen, 
  onClose, 
  onBookNow 
}: ServiceDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'policy'>('overview');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  if (!service) return null;

  const formatDuration = (minutes: number | null, prepTime: number | null = null) => {
    if (!minutes) return 'Duration not specified';
    
    const totalMinutes = minutes + (prepTime || 0);
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      if (prepTime && prepTime > 0) {
        return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''} (includes ${prepTime}m prep)`;
      }
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    
    if (prepTime && prepTime > 0) {
      return `${totalMinutes}m (includes ${prepTime}m prep)`;
    }
    return `${minutes}m`;
  };

  const getComplexityInfo = (level: string | null) => {
    switch (level) {
      case 'basic':
        return { label: 'Basic', color: 'bg-green-100 text-green-800 border-green-200', description: 'Simple, straightforward service' };
      case 'intermediate':
        return { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', description: 'Moderate complexity, some customization' };
      case 'advanced':
        return { label: 'Advanced', color: 'bg-red-100 text-red-800 border-red-200', description: 'Complex service requiring expertise' };
      default:
        return { label: 'Basic', color: 'bg-gray-100 text-gray-800 border-gray-200', description: 'Standard service' };
    }
  };

  const complexityInfo = getComplexityInfo(service.complexity_level);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-800">
            {service.name}
          </DialogTitle>
          <DialogDescription>
            Complete service details and booking information
          </DialogDescription>
        </DialogHeader>

        {/* Service Image */}
        {service.image_url && (
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Key Service Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold text-lg">
                {service.price ? `₦${service.price.toLocaleString()}` : 'Price varies'}
              </span>
            </div>
            <p className="text-xs text-gray-600">Service Price</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="font-bold text-lg">
                {formatDuration(service.duration_minutes, service.preparation_time)}
              </span>
            </div>
            <p className="text-xs text-gray-600">Total Time</p>
          </div>

          <div className="text-center">
            <Badge className={`${complexityInfo.color} mb-1`}>
              {complexityInfo.label}
            </Badge>
            <p className="text-xs text-gray-600">{complexityInfo.description}</p>
          </div>
        </div>

        {/* Special Notices */}
        <div className="space-y-2">
          {service.requires_consultation && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800">Consultation Required</p>
                <p className="text-xs text-orange-700">A consultation is needed before booking this service</p>
              </div>
            </div>
          )}

          {service.specialties && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Category:</span>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                {service.specialties.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b">
          <div className="flex gap-4">
            {['overview', 'requirements', 'policy'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'requirements' ? 'What to Bring' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {service.description && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Service Description</h4>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </div>
              )}

              {service.client_instructions && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    Client Instructions
                  </h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">
                      {service.client_instructions}
                    </p>
                  </div>
                </div>
              )}

              {(service.duration_minutes || service.preparation_time) && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Service Timeline</h4>
                  <div className="space-y-2">
                    {service.preparation_time && service.preparation_time > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Preparation Time:</span>
                        <span className="font-medium">{service.preparation_time} minutes</span>
                      </div>
                    )}
                    {service.duration_minutes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Duration:</span>
                        <span className="font-medium">{service.duration_minutes} minutes</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-medium border-t pt-2">
                      <span className="text-gray-800">Total Time:</span>
                      <span className="text-purple-600">
                        {formatDuration(service.duration_minutes, service.preparation_time)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div>
              <ServiceRequirements 
                serviceId={service.id} 
                isEditable={false}
              />
            </div>
          )}

          {activeTab === 'policy' && (
            <div className="space-y-4">
              {service.cancellation_policy ? (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-600" />
                    Cancellation Policy
                  </h4>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {service.cancellation_policy}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No specific cancellation policy set</p>
                  <p className="text-sm text-gray-400">Standard terms apply</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onBookNow?.();
              onClose();
            }}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book This Service
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};