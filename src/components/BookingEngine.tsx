
import { useState, useEffect } from "react";
import { CalendarDays, Clock, User, Phone, Edit, CheckCircle, AlertTriangle, X, Star, Check, CreditCard, Info } from "lucide-react";
import { format, addMinutes, isSameDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";
import { initializePayment, generatePaymentReference, convertToKobo, formatNaira } from "@/services/paystackService";

interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  description: string;
}

interface DepositSettings {
  require_deposit: boolean;
  deposit_type: 'percentage' | 'fixed';
  deposit_percentage: number;
  deposit_fixed_amount: number;
  deposit_policy: string;
}

interface ProfessionalProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  business_name: string;
  email: string;
  deposit_settings: DepositSettings;
  paystack_subaccount_code: string;
}

interface TimeSlot {
  start: Date;
  end: Date;
  isBooked: boolean;
}

interface BookingEngineProps {
  professionalId: string;
  onClose?: () => void;
  onBookingComplete?: () => void;
}

interface BookingDetails {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const timeSlotInterval = 30; // Minutes
const numberOfDaysToShow = 7;

export const BookingEngine = ({ professionalId, onClose, onBookingComplete }: BookingEngineProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [isBooking, setIsBooking] = useState(false);
  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState(4);
  const { toast } = useToast();

  const { sendConfirmationEmail } = useEmailNotifications();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('user_id', professionalId);

        if (servicesError) throw servicesError;
        setServices(servicesData || []);

        // Fetch professional profile with deposit settings
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, full_name, business_name, email, deposit_settings, paystack_subaccount_code')
          .eq('id', professionalId)
          .single();

        if (profileError) throw profileError;
        setProfessionalProfile(profileData);

        // Check if deposit is required - if so, add payment step
        const depositSettings = profileData?.deposit_settings as DepositSettings;
        if (depositSettings?.require_deposit) {
          setTotalSteps(5); // Add payment step
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load booking data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [professionalId, toast]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      fetchAvailableSlots(selectedDate, selectedService);
    }
  }, [selectedDate, selectedService, professionalId, toast]);

  useEffect(() => {
    if (selectedService && professionalProfile?.deposit_settings) {
      calculateDepositAmount();
    }
  }, [selectedService, professionalProfile]);

  const calculateDepositAmount = () => {
    if (!selectedService || !professionalProfile?.deposit_settings) return;
    
    const settings = professionalProfile.deposit_settings;
    if (!settings.require_deposit) {
      setDepositAmount(0);
      return;
    }

    let amount = 0;
    if (settings.deposit_type === 'percentage') {
      amount = (selectedService.price * settings.deposit_percentage) / 100;
    } else {
      amount = settings.deposit_fixed_amount;
    }
    
    setDepositAmount(Math.round(amount * 100) / 100); // Round to 2 decimal places
  };

  const fetchAvailableSlots = async (date: Date, service: Service) => {
    try {
      const startTime = new Date(date);
      startTime.setHours(8, 0, 0, 0); // Start at 8:00 AM

      const endTime = new Date(date);
      endTime.setHours(18, 0, 0, 0); // End at 6:00 PM

      const slots: TimeSlot[] = [];
      let currentTime = new Date(startTime);

      while (currentTime < endTime) {
        const slotEnd = addMinutes(currentTime, timeSlotInterval);
        slots.push({
          start: new Date(currentTime),
          end: slotEnd,
          isBooked: false,
        });
        currentTime = slotEnd;
      }

      // Fetch existing appointments for the selected date
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('professional_id', professionalId)
        .gte('start_time', startTime.toISOString())
        .lt('start_time', endTime.toISOString());

      if (error) throw error;

      // Mark booked slots
      const bookedSlots = existingAppointments?.map(appt => ({
        start: new Date(appt.start_time),
        end: new Date(appt.end_time),
      })) || [];

      const updatedSlots = slots.map(slot => {
        const isBooked = bookedSlots.some(bookedSlot =>
          slot.start < new Date(bookedSlot.end) && slot.end > new Date(bookedSlot.start)
        );
        return { ...slot, isBooked };
      });

      setAvailableSlots(updatedSlots);

    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      toast({
        title: "Error",
        description: "Failed to load available slots",
        variant: "destructive",
      });
      setAvailableSlots([]);
    }
  };

  const handlePayment = async () => {
    if (!selectedService || !professionalProfile || depositAmount <= 0) return;

    try {
      setIsBooking(true);
      
      const reference = generatePaymentReference('FB_DEP');
      const metadata = {
        appointment_type: 'deposit',
        service_id: selectedService.id,
        professional_id: professionalId,
        client_name: bookingDetails.name,
        client_email: bookingDetails.email,
        appointment_date: selectedDate?.toISOString(),
        appointment_time: selectedTimeSlot?.start.toISOString(),
      };

      const paymentData = {
        amount: convertToKobo(depositAmount),
        email: bookingDetails.email,
        reference,
        callback_url: `${window.location.origin}/payment/confirmation`,
        metadata,
        subaccount: professionalProfile.paystack_subaccount_code,
        bearer: 'subaccount' as const,
      };

      const response = await initializePayment(paymentData);
      
      // Store payment info in session storage for verification
      sessionStorage.setItem('booking_payment', JSON.stringify({
        reference,
        appointment_data: {
          professional_id: professionalId,
          service_id: selectedService.id,
          start_time: selectedTimeSlot?.start.toISOString(),
          end_time: selectedTimeSlot?.end.toISOString(),
          client_name: bookingDetails.name,
          client_email: bookingDetails.email,
          client_phone: bookingDetails.phone || null,
          notes: bookingDetails.notes || null,
          deposit_required: true,
          deposit_amount: depositAmount,
          total_amount: selectedService.price,
          payment_reference: reference,
        },
      }));

      // Redirect to Paystack
      window.location.href = response.authorization_url;
      
    } catch (error: any) {
      console.error('Error initializing payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTimeSlot || !selectedService || !bookingDetails.name || !bookingDetails.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // If deposit is required, handle payment flow
    if (professionalProfile?.deposit_settings?.require_deposit && depositAmount > 0) {
      await handlePayment();
      return;
    }

    // Direct booking without deposit
    setIsBooking(true);

    try {
      const professionalName = professionalProfile?.first_name && professionalProfile?.last_name
        ? `${professionalProfile.first_name} ${professionalProfile.last_name}`
        : professionalProfile?.full_name || professionalProfile?.business_name || 'Beauty Professional';

      // Create the appointment
      const appointmentData = {
        professional_id: professionalId,
        service_id: selectedService.id,
        start_time: selectedTimeSlot.start.toISOString(),
        end_time: selectedTimeSlot.end.toISOString(),
        client_name: bookingDetails.name,
        client_email: bookingDetails.email,
        client_phone: bookingDetails.phone || null,
        notes: bookingDetails.notes || null,
        status: 'confirmed',
        deposit_required: false,
        payment_status: 'pending',
        total_amount: selectedService.price,
      };

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Send confirmation emails
      try {
        await sendConfirmationEmail(
          {
            ...appointment,
            service: selectedService,
          },
          professionalName
        );
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }

      // Send notification email to professional
      if (professionalProfile?.email) {
        try {
          await supabase.functions.invoke('send-appointment-email', {
            body: {
              type: 'professional_notification',
              appointmentId: appointment.id,
              recipientEmail: professionalProfile.email,
              recipientName: professionalName,
              professionalName: professionalName,
              serviceName: selectedService.name,
              appointmentDate: selectedTimeSlot.start.toISOString(),
              appointmentTime: selectedTimeSlot.start.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }),
              duration: selectedService.duration_minutes || 60,
              price: selectedService.price || 0,
              notes: bookingDetails.notes || '',
              clientName: bookingDetails.name,
              clientEmail: bookingDetails.email,
              clientPhone: bookingDetails.phone || ''
            }
          });
        } catch (error) {
          console.error('Error sending professional notification:', error);
        }
      }

      toast({
        title: "Booking Confirmed! 🎉",
        description: `Your appointment for ${selectedService.name} has been booked for ${formatDate(selectedDate)} at ${selectedTimeSlot.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
      });

      // Reset form and close
      setCurrentStep(1);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setBookingDetails({ name: '', email: '', phone: '', notes: '' });
      setAvailableSlots([]);
      
      if (onBookingComplete) {
        onBookingComplete();
      }
      if (onClose) {
        onClose();
      }

    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (date: Date): string => {
    return format(date, 'MMMM dd, yyyy');
  };

  const renderServiceSelection = () => (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {services.map((service, index) => {
        const isSelected = selectedService?.id === service.id;
        const isPopular = index === 0; // First service is marked as popular for demo
        
        return (
          <div
            key={service.id}
            className={`relative group cursor-pointer rounded-xl border-2 transition-all duration-300 p-4 hover:shadow-lg ${
              isSelected 
                ? 'border-purple-600 bg-purple-50 shadow-md' 
                : 'border-gray-200 hover:border-purple-300 bg-white'
            }`}
            onClick={() => setSelectedService(service)}
          >
            {/* Popular Badge */}
            {isPopular && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-current" />
                  Popular
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              {/* Service Icon/Avatar */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-colors ${
                isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {service.name.charAt(0)}
              </div>

              {/* Service Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`text-lg font-semibold transition-colors ${
                      isSelected ? 'text-purple-800' : 'text-gray-900'
                    }`}>
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {service.description || "Professional beauty service"}
                    </p>
                  </div>
                  
                  {/* Selection Indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'border-gray-300 group-hover:border-purple-400'
                  }`}>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </div>

                {/* Price and Duration */}
                <div className="flex items-center gap-4 mt-3">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <span className="text-lg font-bold">{formatNaira(service.price)}</span>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                    isSelected ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  
                  {/* Deposit Badge */}
                  {isSelected && professionalProfile?.deposit_settings?.require_deposit && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Deposit Required
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Service Highlight */}
            {isSelected && (
              <div className="absolute inset-0 rounded-xl bg-purple-600/5 pointer-events-none"></div>
            )}
          </div>
        );
      })}
      
      {services.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No services available at the moment.</p>
        </div>
      )}
    </div>
  );

  const renderDateTimeSelection = () => (
    <div className="flex flex-col md:flex-row gap-4">
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle className="text-lg">Select a Date</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) =>
              date < new Date() || date > addMinutes(new Date(), numberOfDaysToShow * 24 * 60)
            }
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle className="text-lg">Select a Time</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {selectedDate ? (
            availableSlots.length > 0 ? (
              <RadioGroup onValueChange={(value) => {
                const selected = availableSlots.find(slot => slot.start.toISOString() === value);
                setSelectedTimeSlot(selected || null);
              }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <div key={slot.start.toISOString()} className="space-y-2">
                      <RadioGroupItem 
                        value={slot.start.toISOString()} 
                        id={`time-${slot.start.toISOString()}`} 
                        className="aspect-square h-8 w-8 rounded-full bg-muted text-muted-foreground shadow-[0_0_0_2px] shadow-transparent data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-[0_0_0_2px] data-[state=checked]:shadow-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50" 
                        disabled={slot.isBooked} 
                      />
                      <Label htmlFor={`time-${slot.start.toISOString()}`} className="peer-checked:text-primary">
                        {format(slot.start, 'h:mm a')}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <div className="flex items-center justify-center h-32">
                <AlertTriangle className="mr-2 h-4 w-4" />
                No slots available for this day.
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-32">
              <CalendarDays className="mr-2 h-4 w-4" />
              Please select a date to see available times.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderBookingDetailsForm = () => (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="name">Your Name</Label>
        <Input
          type="text"
          id="name"
          placeholder="John Doe"
          value={bookingDetails.name}
          onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input
          type="email"
          id="email"
          placeholder="john.doe@example.com"
          value={bookingDetails.email}
          onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          type="tel"
          id="phone"
          placeholder="(555) 123-4567"
          value={bookingDetails.phone}
          onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Anything we should know before your appointment?"
          rows={4}
          value={bookingDetails.notes}
          onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
        />
      </div>
    </div>
  );

  const renderPaymentInfo = () => (
    <div className="space-y-6">
      {/* Service Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Service:</span>
            <span className="font-medium">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Price:</span>
            <span className="font-medium">{formatNaira(selectedService?.price || 0)}</span>
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-semibold">Deposit Required:</span>
            <span className="font-bold text-lg text-purple-600">{formatNaira(depositAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Remaining Balance:</span>
            <span>{formatNaira((selectedService?.price || 0) - depositAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Policy */}
      {professionalProfile?.deposit_settings?.deposit_policy && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {professionalProfile.deposit_settings.deposit_policy}
          </AlertDescription>
        </Alert>
      )}

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Date & Time:</span>
            <span className="font-medium">
              {selectedDate && formatDate(selectedDate)} at {selectedTimeSlot?.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Duration:</span>
            <span className="font-medium">{selectedService?.duration_minutes} minutes</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Client:</span>
            <span className="font-medium">{bookingDetails.name}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConfirmation = () => (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Service</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedService?.name} - {formatNaira(selectedService?.price || 0)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Date & Time</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate && formatDate(selectedDate)} at {selectedTimeSlot?.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Name: {bookingDetails.name}</p>
          <p>Email: {bookingDetails.email}</p>
          {bookingDetails.phone && <p>Phone: {bookingDetails.phone}</p>}
          {bookingDetails.notes && <p>Notes: {bookingDetails.notes}</p>}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 p-2 h-8 w-8 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 pr-12">Book Appointment</h2>
          <p className="text-gray-500 mt-1">
            {currentStep === 1 && "Choose a service to book."}
            {currentStep === 2 && "Select date and time for your appointment."}
            {currentStep === 3 && "Enter your contact information."}
            {currentStep === 4 && (totalSteps === 5 ? "Review payment details." : "Confirm your booking details.")}
            {currentStep === 5 && "Confirm your booking details."}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 ml-2">{currentStep}/{totalSteps}</div>
          </div>
        </div>

        <div className="p-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select a Service</h2>
              {renderServiceSelection()}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Date & Time</h2>
              {renderDateTimeSelection()}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Information</h2>
              {renderBookingDetailsForm()}
            </div>
          )}

          {currentStep === 4 && totalSteps === 5 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Required</h2>
              {renderPaymentInfo()}
            </div>
          )}

          {currentStep === 4 && totalSteps === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Confirm Your Booking</h2>
              {renderConfirmation()}
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Confirm Your Booking</h2>
              {renderConfirmation()}
            </div>
          )}
        </div>

        <div className="flex justify-between p-6 border-t">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              Back
            </Button>
          )}
          <div className="flex-1"></div>
          {currentStep < totalSteps ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={
              (currentStep === 1 && !selectedService) ||
              (currentStep === 2 && (!selectedDate || !selectedTimeSlot)) ||
              (currentStep === 3 && (!bookingDetails.name || !bookingDetails.email))
            }>
              {currentStep === 4 && totalSteps === 5 ? 'Continue to Payment' : 'Next'} <Edit className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleBooking} disabled={isBooking}>
              {isBooking ? (
                <>Processing... <svg className="animate-spin h-5 w-5 ml-2" viewBox="0 0 24 24"></svg></>
              ) : totalSteps === 5 && depositAmount > 0 ? (
                <>Pay Deposit {formatNaira(depositAmount)} <CreditCard className="ml-2 h-4 w-4" /></>
              ) : (
                <>Confirm & Book <CheckCircle className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
