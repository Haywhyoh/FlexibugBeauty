import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, Star, Image, Info } from "lucide-react";
import { BrandColors, defaultBrandColors, getBrandInlineStyles } from "@/lib/brandColors";

interface Service {
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
}

interface ServiceCardProps {
  service: Service;
  index: number;
  onViewDetails: (service: Service) => void;
  onBookNow: (service: Service) => void;
  brandColors?: BrandColors | null;
}

export const ServiceCard = ({ service, index, onViewDetails, onBookNow, brandColors }: ServiceCardProps) => {
  // Get brand colors or use defaults
  const colors = brandColors || defaultBrandColors;
  const styles = getBrandInlineStyles(colors);

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Service Image */}
      <div className="relative">
        {service.image_url ? (
          <div className="h-32 sm:h-40 overflow-hidden">
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div 
            className="h-32 sm:h-40 flex items-center justify-center"
            style={{
              background: `linear-gradient(to bottom right, ${colors.primaryLight}, ${colors.primaryLight}80)`
            }}
          >
            <Image 
              className="w-8 h-8 sm:w-12 sm:h-12" 
              style={{ color: colors.primary }}
            />
          </div>
        )}
        
        {/* Price Badge */}
        {service.price && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 sm:px-3 sm:py-1 shadow-lg">
            <span 
              className="text-sm sm:text-lg font-bold flex items-center"
              style={styles.primary}
            >
              ₦{service.price.toLocaleString()}
            </span>
          </div>
        )}

        {/* Service Indicators */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1">
          {service.requires_consultation && (
            <div className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
              <AlertCircle className="w-3 h-3" />
            </div>
          )}
          {service.complexity_level === 'advanced' && (
            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
              <Star className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-3 sm:p-4">
        {/* Service Header */}
        <div className="mb-2 sm:mb-3">
          <h3 
            className="text-base sm:text-lg font-bold text-gray-800 mb-1 line-clamp-1 transition-colors"
            style={{ '--hover-color': colors.primary } as React.CSSProperties & { '--hover-color': string }}
          >
            {service.name}
          </h3>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {service.specialties && (
              <Badge 
                className="text-xs px-2 py-0.5"
                style={{
                  backgroundColor: colors.primaryLight,
                  color: colors.primaryDark,
                  borderColor: colors.primary
                }}
              >
                {service.specialties.name}
              </Badge>
            )}
            {service.duration_minutes && (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  {service.preparation_time && service.preparation_time > 0 
                    ? `${service.duration_minutes + service.preparation_time}min (${service.preparation_time}m prep)`
                    : `${service.duration_minutes}min`
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Service Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {service.requires_consultation && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
              Consultation Required
            </Badge>
          )}
          {service.complexity_level === 'advanced' && (
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
              Advanced
            </Badge>
          )}
          {service.client_instructions && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
              Prep Required
            </Badge>
          )}
        </div>
        
        {/* Description */}
        {service.description && (
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2">
            {service.description}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="text-xs flex items-center gap-1"
            onClick={() => onViewDetails(service)}
          >
            <Info className="w-3 h-3" />
            Details
          </Button>
          <Button 
            className="flex-1 text-white rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all duration-300"
            style={{
              backgroundColor: colors.primary,
              '--hover-bg': colors.primaryDark
            } as React.CSSProperties & { '--hover-bg': string }}
            onClick={() => onBookNow(service)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

