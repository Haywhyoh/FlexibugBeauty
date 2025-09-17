import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, Instagram, Star, Calendar, Facebook } from "lucide-react";
import { BrandColors, defaultBrandColors, getBrandInlineStyles } from "@/lib/brandColors";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  business_name: string | null;
  business_slug: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  instagram_handle: string | null;
  facebook_handle: string | null;
  tiktok_handle: string | null;
  website_url: string | null;
  years_experience: number | null;
  phone: string | null;
  business_hours: any;
  business_address: string | null;
  business_description: string | null;
  brand_colors?: BrandColors | null;
}

interface HeroSectionProps {
  profile: Profile;
  servicesCount: number;
  onBookNow: () => void;
}

export const HeroSection = ({ profile, servicesCount, onBookNow }: HeroSectionProps) => {
  // Get brand colors or use defaults
  const brandColors = profile.brand_colors || defaultBrandColors;
  const styles = getBrandInlineStyles(brandColors);

  // Get display name - prioritize first_name + last_name, then fall back to full_name or business_name
  const getDisplayName = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) return profile.first_name;
    if (profile.full_name) return profile.full_name;
    return profile.business_name || 'Professional';
  };

  const getInitials = () => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    if (profile.first_name) return profile.first_name.charAt(0).toUpperCase();
    if (profile.full_name) {
      const names = profile.full_name.split(' ');
      return names.map(name => name.charAt(0)).join('').toUpperCase();
    }
    return profile.business_name?.charAt(0).toUpperCase() || 'P';
  };

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        {profile.cover_url ? (
          <img 
            src={profile.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{
              background: `linear-gradient(to bottom right, ${brandColors.primary}, ${brandColors.secondary}, ${brandColors.accent})`
            }}
          >
            {/* Animated Background Elements - Hidden on mobile for performance */}
            <div 
              className="hidden md:block absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse"
              style={{ backgroundColor: `${brandColors.primaryLight}50` }}
            ></div>
            <div 
              className="hidden md:block absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000"
              style={{ backgroundColor: `${brandColors.accent}50` }}
            ></div>
          </div>
        )}
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      {/* Profile Content Overlaying Cover */}
      <div className="relative container mx-auto px-3 sm:px-4 -mt-20 sm:-mt-24 md:-mt-28 pb-8 sm:pb-12">
        {/* Floating Profile Card */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 md:p-8 transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6">
              {/* Profile Avatar */}
              <div className="relative -mt-8 sm:-mt-12 md:-mt-16">
                <div className="absolute -inset-1 sm:-inset-2 bg-white rounded-full"></div>
                <Avatar className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 border-2 sm:border-4 border-white shadow-xl bg-white">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback 
                    className="text-2xl sm:text-3xl lg:text-5xl"
                    style={styles.bgPrimaryLight}
                  >
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {/* Status Indicator */}
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-white shadow-lg animate-pulse"></div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                {/* Name and Title */}
                <div className="mb-4 sm:mb-6">
                  <h1 
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 leading-tight"
                    style={styles.textPrimary}
                  >
                    {profile.business_name || getDisplayName()}
                  </h1>
                  {profile.business_name && getDisplayName() !== profile.business_name && (
                    <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-1 sm:mb-2">{getDisplayName()}</p>
                  )}
                </div>
                
                {/* Stats Row */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 md:gap-4 text-gray-600 mb-4 sm:mb-6">
                  {profile.location && (
                    <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                      <MapPin 
                        className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" 
                        style={styles.primary}
                      />
                      <span className="font-medium text-xs sm:text-sm">{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-500 fill-current" />
                    <span className="font-medium text-xs sm:text-sm">5.0 ⭐ (24 reviews)</span>
                  </div>
                  <div 
                    className="flex items-center gap-1 sm:gap-2 rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2"
                    style={styles.bgPrimaryLight}
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-xs sm:text-sm" style={styles.textPrimary}>Available now</span>
                  </div>
                </div>

                {/* Bio - Instagram Style */}
                {profile.bio && (
                  <div className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6 max-w-3xl text-center lg:text-left">
                    <div className="space-y-0.5">
                      {profile.bio.split('\n').map((line, index) => {
                        // Skip empty lines
                        if (!line.trim()) {
                          return <div key={index} className="h-1"></div>;
                        }
                        
                        // Each line is displayed as entered by the user
                        return (
                          <div key={index} className="block text-center lg:text-left">
                            {line}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Social Links and CTA - Icons Only */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                  {profile.phone && (
                    <Button variant="outline" size="sm" className="rounded-full hover:scale-105 transition-transform w-10 h-10 p-0" asChild>
                      <a href={`tel:${profile.phone}`}>
                        <Phone className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {profile.instagram_handle && (
                    <Button variant="outline" size="sm" className="rounded-full hover:scale-105 transition-transform w-10 h-10 p-0" asChild>
                      <a href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {profile.facebook_handle && (
                    <Button variant="outline" size="sm" className="rounded-full hover:scale-105 transition-transform w-10 h-10 p-0" asChild>
                      <a href={`https://facebook.com/${profile.facebook_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Facebook className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  {profile.tiktok_handle && (
                    <Button variant="outline" size="sm" className="rounded-full hover:scale-105 transition-transform w-10 h-10 p-0" asChild>
                      <a href={`https://tiktok.com/@${profile.tiktok_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </a>
                    </Button>
                  )}
                  {profile.website_url && (
                    <Button variant="outline" size="sm" className="rounded-full hover:scale-105 transition-transform w-10 h-10 p-0" asChild>
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Primary CTA */}
            <div className="mt-6 sm:mt-8 text-center">
              <Button 
                size="lg"
                className="text-white text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                style={{
                  backgroundColor: brandColors.primary,
                  '--hover-bg': brandColors.primaryDark
                } as React.CSSProperties & { '--hover-bg': string }}
                onClick={onBookNow}
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3" />
                <span className="hidden sm:inline">Book Your Appointment Now</span>
                <span className="sm:hidden">Book Appointment</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

