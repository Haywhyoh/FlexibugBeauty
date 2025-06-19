
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Globe, Instagram, Star, Clock, DollarSign, Calendar, Facebook } from "lucide-react";
import { BookingEngine } from "./BookingEngine";

interface PublicProfileData {
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    business_name: string | null;
    business_slug: string | null;
    bio: string | null;
    avatar_url: string | null;
    location: string | null;
    instagram_handle: string | null;
    facebook_handle: string | null;
    tiktok_handle: string | null;
    website_url: string | null;
    years_experience: number | null;
    phone: string | null;
  };
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    duration_minutes: number | null;
    specialties: { name: string } | null;
  }>;
  portfolioItems: Array<{
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    specialties: { name: string } | null;
    is_featured: boolean | null;
  }>;
}

export const PublicProfile = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (profileId) {
      fetchPublicProfile();
    }
  }, [profileId]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);

      // Check if profileId is a UUID or a business slug
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId!);
      
      // Fetch profile based on whether it's a UUID or business slug
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq(isUUID ? 'id' : 'business_slug', profileId)
        .eq('is_profile_public', true)
        .single();

      if (profileError) throw profileError;

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          name,
          description,
          price,
          duration_minutes,
          specialties(name)
        `)
        .eq('user_id', profileData.id)
        .eq('is_active', true);

      if (servicesError) throw servicesError;

      // Fetch portfolio items
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolio_items')
        .select(`
          id,
          title,
          description,
          image_url,
          is_featured,
          specialties(name)
        `)
        .eq('user_id', profileData.id)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (portfolioError) throw portfolioError;

      setProfileData({
        profile: profileData,
        services: servicesData || [],
        portfolioItems: portfolioData || [],
      });
    } catch (error) {
      console.error('Error fetching public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">This profile is not available or has been set to private.</p>
        </div>
      </div>
    );
  }

  const { profile, services, portfolioItems } = profileData;
  
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
  
  // Get unique categories from portfolio items
  const categories = Array.from(
    new Set(portfolioItems.map(item => item.specialties?.name).filter(Boolean))
  );

  const filteredPortfolio = selectedCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.specialties?.name === selectedCategory);

  // Show booking interface if user clicked book appointment
  if (showBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back to Profile Button */}
          <Button 
            variant="outline" 
            onClick={() => setShowBooking(false)}
            className="mb-6"
          >
            ← Back to Profile
          </Button>
          
          {/* Professional Info Header */}
          <Card className="bg-white/80 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Book with {profile.business_name || getDisplayName()}
                  </h2>
                  {profile.location && (
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Engine */}
          <BookingEngine 
            professionalId={profile.id} 
            onBookingComplete={() => {
              // Could redirect to success page or show confirmation
              setShowBooking(false);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <Card className="bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-4xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {profile.business_name || getDisplayName()}
                </h1>
                {profile.business_name && getDisplayName() !== profile.business_name && (
                  <p className="text-xl text-gray-700 mb-2">{getDisplayName()}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.years_experience && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{profile.years_experience} years experience</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <p className="text-gray-700 leading-relaxed mb-4">{profile.bio}</p>
                )}

                <div className="flex flex-wrap gap-3">
                  {profile.phone && (
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4 mr-2" />
                      {profile.phone}
                    </Button>
                  )}
                  {profile.instagram_handle && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4 mr-2" />
                        {profile.instagram_handle}
                      </a>
                    </Button>
                  )}
                  {profile.facebook_handle && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://facebook.com/${profile.facebook_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Facebook className="w-4 h-4 mr-2" />
                        {profile.facebook_handle}
                      </a>
                    </Button>
                  )}
                  {profile.tiktok_handle && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://tiktok.com/@${profile.tiktok_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                        {profile.tiktok_handle}
                      </a>
                    </Button>
                  )}
                  {profile.website_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    onClick={() => setShowBooking(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        {services.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Services & Pricing</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">{service.name}</h3>
                      {service.specialties && (
                        <Badge variant="outline" className="text-xs">
                          {service.specialties.name}
                        </Badge>
                      )}
                    </div>
                    
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {service.price && (
                        <span className="text-xl font-bold text-purple-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {service.price}
                        </span>
                      )}
                      {service.duration_minutes && (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration_minutes} min
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Section */}
        {portfolioItems.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Portfolio</h2>
              
              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex gap-2 mb-6 overflow-x-auto">
                  <Button
                    variant={selectedCategory === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Work ({portfolioItems.length})
                  </Button>
                  {categories.map((category) => {
                    const count = portfolioItems.filter(item => item.specialties?.name === category).length;
                    return (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category} ({count})
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Portfolio Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPortfolio.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.is_featured && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 rounded-lg">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-200">{item.description}</p>
                        )}
                        {item.specialties && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {item.specialties.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
