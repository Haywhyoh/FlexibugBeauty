import { Button } from "@/components/ui/button";
import { Calendar, Phone } from "lucide-react";

interface Profile {
  phone: string | null;
}

interface ContactSectionProps {
  profile: Profile;
  servicesCount: number;
  onBookNow: () => void;
}

export const ContactSection = ({ profile, servicesCount, onBookNow }: ContactSectionProps) => {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-16 max-w-4xl text-center">
      <div className="bg-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
        {/* Background Pattern - Hidden on mobile */}
        <div className="hidden sm:block absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
        </div>
        
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">Ready to Transform Your Look?</h2>
          <p className="text-sm sm:text-base lg:text-xl mb-6 sm:mb-8 opacity-90 leading-relaxed">
            Book your appointment today and experience professional beauty services that enhance your natural beauty.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-50 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              onClick={onBookNow}
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
              Book Appointment
            </Button>
            
            {profile.phone && (
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-purple-600 rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold w-full sm:w-auto"
                asChild
              >
                <a href={`tel:${profile.phone}`}>
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
                  Call Now
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

