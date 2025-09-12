import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ServiceRequirements } from "@/components/ServiceRequirements";
import { BookingEngine } from "@/components/BookingEngine";
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  MapPin, 
  AlertCircle, 
  Calendar,
  Star,
  User,
  Settings,
  CheckCircle2,
  Info,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/services/paystackService";

interface DepositSettings {
  require_deposit: boolean;
  deposit_type: 'percentage' | 'fixed';
  deposit_percentage: number;
  deposit_fixed_amount: number;
  deposit_policy: string;
}

interface BookingPageData {
  professional: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    business_name: string | null;
    business_slug: string | null;
    avatar_url: string | null;
    location: string | null;
    phone: string | null;
    deposit_settings: DepositSettings;
  };
  service: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    duration_minutes: number | null;
    specialties: { name: string } | null;
  };
}

export const BookingPage = () => {
  const { profileId, serviceId } = useParams<{ profileId: string; serviceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bookingData, setBookingData] = useState<BookingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<'review' | 'requirements' | 'booking'>('review');
  const [requirementsAcknowledged, setRequirementsAcknowledged] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);

  // Debug logging
  useEffect(() => {
    console.log('BookingPage - profileId:', profileId, 'serviceId:', serviceId);
  }, [profileId, serviceId]);

  const calculateDepositAmount = (settings: DepositSettings, servicePrice: number) => {
    if (!settings.require_deposit) {
      setDepositAmount(0);
      return;
    }

    let amount = 0;
    if (settings.deposit_type === 'percentage') {
      amount = (servicePrice * settings.deposit_percentage) / 100;
    } else {
      amount = settings.deposit_fixed_amount;
    }
    
    setDepositAmount(Math.round(amount * 100) / 100); // Round to 2 decimal places
  };

  useEffect(() => {
    if (profileId && serviceId) {
      fetchBookingData();
    } else {
      console.error('Missing required parameters:', { profileId, serviceId });
      toast({
        title: "Error",
        description: "Invalid booking link. Please try again from the profile page.",
        variant: "destructive",
      });
      navigate(-1);
    }
  }, [profileId, serviceId, navigate, toast]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      console.log('Fetching booking data for profileId:', profileId, 'serviceId:', serviceId);

      // Check if profileId is a UUID or a business slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId!);
      console.log('ProfileId is UUID:', isUUID);
      
      // Fetch professional profile with deposit settings
      const { data: professionalData, error: professionalError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, full_name, business_name, business_slug, avatar_url, location, phone, deposit_settings')
        .eq(isUUID ? 'id' : 'business_slug', profileId)
        .eq('is_profile_public', true)
        .single();

      if (professionalError) {
        console.error('Professional profile error:', professionalError);
        throw professionalError;
      }
      console.log('Professional data fetched:', professionalData);

      // Fetch service details
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select(`
          id,
          name,
          description,
          price,
          duration_minutes,
          specialties!specialty_id(name)
        `)
        .eq('id', serviceId)
        .eq('user_id', professionalData.id)
        .eq('is_active', true)
        .single();

      if (serviceError) {
        console.error('Service data error:', serviceError);
        throw serviceError;
      }
      console.log('Service data fetched:', serviceData);

      setBookingData({
        professional: {
          ...professionalData,
          deposit_settings: professionalData.deposit_settings as unknown as DepositSettings
        },
        service: serviceData,
      });

      // Calculate deposit amount if required
      const depositSettings = professionalData.deposit_settings as unknown as DepositSettings;
      if (depositSettings?.require_deposit && serviceData.price) {
        calculateDepositAmount(depositSettings, serviceData.price);
      }
    } catch (error) {
      console.error('Error fetching booking data:', error);
      
      let errorMessage = "Failed to load booking information";
      if (error instanceof Error) {
        if (error.message.includes('No rows found')) {
          errorMessage = "Service or profile not found. Please check the link and try again.";
        } else if (error.message.includes('JWT')) {
          errorMessage = "Authentication error. Please refresh the page and try again.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking information...</p>
          <p className="text-xs text-gray-500 mt-2">
            ProfileId: {profileId || 'undefined'}, ServiceId: {serviceId || 'undefined'}
          </p>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Service Not Found</h1>
          <p className="text-gray-600 mb-4">This service is not available or has been deactivated.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const { professional, service } = bookingData;

  const getDisplayName = () => {
    if (professional.first_name && professional.last_name) {
      return `${professional.first_name} ${professional.last_name}`;
    }
    if (professional.first_name) return professional.first_name;
    if (professional.full_name) return professional.full_name;
    return professional.business_name || 'Professional';
  };

  const getInitials = () => {
    if (professional.first_name && professional.last_name) {
      return `${professional.first_name.charAt(0)}${professional.last_name.charAt(0)}`.toUpperCase();
    }
    if (professional.first_name) return professional.first_name.charAt(0).toUpperCase();
    if (professional.full_name) {
      const names = professional.full_name.split(' ');
      return names.map(name => name.charAt(0)).join('').toUpperCase();
    }
    return professional.business_name?.charAt(0).toUpperCase() || 'P';
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Duration not specified';
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    
    return `${minutes}m`;
  };

  const renderProgressSteps = () => {
    const steps = [
      { key: 'review', label: 'Service Review', shortLabel: 'Review', icon: Info },
      { key: 'requirements', label: 'Requirements', shortLabel: 'Requirements', icon: CheckCircle2 },
      { key: 'booking', label: 'Book Appointment', shortLabel: 'Book', icon: Calendar },
    ];

    return (
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full max-w-md sm:max-w-none">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.key === currentStep;
            const isCompleted = 
              (step.key === 'review' && currentStep !== 'review') ||
              (step.key === 'requirements' && currentStep === 'booking');

            return (
              <div key={step.key} className="flex items-center flex-1 sm:flex-none">
                <div className="flex flex-col sm:flex-row items-center sm:gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isActive 
                        ? 'bg-purple-600 border-purple-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className={`text-xs sm:text-sm font-medium mt-1 sm:mt-0 text-center sm:text-left ${
                    isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span className="sm:hidden">{step.shortLabel}</span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-4 sm:w-12 h-0.5 mx-2 sm:mx-4 flex-shrink-0 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderServiceReview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Service Image - Removed as image_url column doesn't exist */}

      {/* Service Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="text-center p-3 sm:p-4">
          <CardContent className="p-0">
            <div className="flex items-center justify-center gap-1 sm:gap-2 text-purple-600 mb-1 sm:mb-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-lg sm:text-xl">
                {service.price ? formatNaira(service.price) : 'Price varies'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Service Price</p>
            {bookingData?.professional.deposit_settings?.require_deposit && service.price && (
              <div className="mt-2">
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  {formatNaira(depositAmount)} deposit required
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="text-center p-3 sm:p-4">
          <CardContent className="p-0">
            <div className="flex items-center justify-center gap-1 sm:gap-2 text-purple-600 mb-1 sm:mb-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-lg sm:text-xl">
                {formatDuration(service.duration_minutes)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Duration</p>
          </CardContent>
        </Card>

        <Card className="text-center p-3 sm:p-4">
          <CardContent className="p-0">
            <div className="flex items-center justify-center gap-1 sm:gap-2 text-purple-600 mb-1 sm:mb-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold text-lg sm:text-xl">
                {service.specialties?.name || 'General'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Specialty</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Description */}
      {service.description && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">About This Service</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{service.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Deposit Information */}
      {bookingData?.professional.deposit_settings?.require_deposit && service.price && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">Deposit Required</h4>
                <div className="space-y-2 text-xs sm:text-sm text-green-700">
                  <p><span className="font-medium">Deposit Amount:</span> {formatNaira(depositAmount)}</p>
                  <p><span className="font-medium">Remaining Balance:</span> {formatNaira(service.price - depositAmount)}</p>
                  <p className="text-green-600 leading-relaxed">
                    {bookingData.professional.deposit_settings.deposit_policy}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notices - Removed as fields don't exist in current schema */}
    </div>
  );

  const renderRequirements = () => (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            Service Requirements & Preparation
          </CardTitle>
          <p className="text-sm sm:text-base text-gray-600">
            Please review these requirements carefully to ensure your appointment goes smoothly.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <ServiceRequirements 
            serviceId={service.id} 
            isEditable={false}
          />
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="requirements-acknowledged"
              checked={requirementsAcknowledged}
              onChange={(e) => setRequirementsAcknowledged(e.target.checked)}
              className="mt-1 rounded flex-shrink-0"
            />
            <label htmlFor="requirements-acknowledged" className="text-xs sm:text-sm text-purple-800 leading-relaxed">
              <span className="font-medium">I acknowledge that I have read and understand all service requirements</span>
              <br />
              <span className="text-purple-700">
                I will come prepared according to the instructions above and understand the cancellation policy.
              </span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Profile</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Professional Header */}
        <Card className="bg-white/90 backdrop-blur-sm mb-4 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
              <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                <AvatarImage src={professional.avatar_url || undefined} />
                <AvatarFallback className="text-lg sm:text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-800 leading-tight">
                  Book {service.name}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mt-1">
                  with {professional.business_name || getDisplayName()}
                </p>
                {professional.location && (
                  <p className="text-sm sm:text-base text-gray-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    {professional.location}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        {currentStep !== 'booking' && renderProgressSteps()}

        {/* Step Content */}
        {currentStep === 'review' && (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                {service.name}
              </CardTitle>
              {service.specialties && (
                <Badge className="w-fit bg-purple-100 text-purple-700 border-purple-200 text-xs sm:text-sm">
                  {service.specialties.name}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {renderServiceReview()}
              <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                <Button
                  onClick={() => setCurrentStep('requirements')}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base py-2 sm:py-3"
                >
                  <span className="hidden sm:inline">Continue to Requirements</span>
                  <span className="sm:hidden">Continue</span>
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'requirements' && (
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-6">
              {renderRequirements()}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('review')}
                  className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back to Review</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <Button
                  onClick={() => setCurrentStep('booking')}
                  disabled={!requirementsAcknowledged}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2 sm:py-3"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Book Appointment</span>
                  <span className="sm:hidden">Book Now</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 'booking' && (
          <BookingEngine 
            professionalId={professional.id}
            preselectedServiceId={service.id}
            onClose={() => setCurrentStep('requirements')}
            onBookingComplete={() => {
              toast({
                title: "Booking Confirmed!",
                description: "Your appointment has been successfully booked.",
              });
              navigate(`/profile/${professional.business_slug || professional.id}`);
            }}
          />
        )}
      </div>
    </div>
  );
};