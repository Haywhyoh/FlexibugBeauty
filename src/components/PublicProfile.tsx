
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Globe, Instagram, Star, Clock, DollarSign, Calendar, Facebook, Image, Search, Filter, AlertCircle, Info } from "lucide-react";
import { ServiceDetailsModal } from "./ServiceDetailsModal";

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
    cover_url: string | null;
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
    image_url: string | null;
    client_instructions: string | null;
    preparation_time: number | null;
    requires_consultation: boolean | null;
    complexity_level: string | null;
    cancellation_policy: string | null;
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
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Service filtering and pagination states
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceCategory, setServiceCategory] = useState<string>('all');
  const [servicesPerPage] = useState(12);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedService, setSelectedService] = useState<PublicProfileData['services'][0] | null>(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);

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
          image_url,
          client_instructions,
          preparation_time,
          requires_consultation,
          complexity_level,
          cancellation_policy,
          specialties!specialty_id(name)
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
          specialties!specialty_id(name)
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

  // Get unique service categories
  const serviceCategories = Array.from(
    new Set(services.map(service => service.specialties?.name).filter(Boolean))
  );

  // Filter and sort services
  const getFilteredAndSortedServices = () => {
    let filtered = services;

    // Text search
    if (serviceSearchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (serviceCategory !== 'all') {
      filtered = filtered.filter(service => service.specialties?.name === serviceCategory);
    }

    // Price range filter
    if (priceRange !== 'all' && priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(service => {
        if (!service.price) return false;
        if (max) {
          return service.price >= min && service.price <= max;
        }
        return service.price >= min;
      });
    }

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'duration-short':
          return (a.duration_minutes || 0) - (b.duration_minutes || 0);
        case 'duration-long':
          return (b.duration_minutes || 0) - (a.duration_minutes || 0);
        default: // 'name'
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  };

  const filteredServices = getFilteredAndSortedServices();
  const totalServicePages = Math.ceil(filteredServices.length / servicesPerPage);
  const paginatedServices = filteredServices.slice(
    (currentServicePage - 1) * servicesPerPage,
    currentServicePage * servicesPerPage
  );


  return (
    <div className="min-h-screen">
      {/* Hero Section with Cover Image */}
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
            <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400">
              {/* Animated Background Elements - Hidden on mobile for performance */}
              <div className="hidden md:block absolute top-10 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="hidden md:block absolute bottom-10 right-10 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                    <AvatarFallback className="text-2xl sm:text-3xl lg:text-5xl bg-purple-100">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-white shadow-lg animate-pulse"></div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  {/* Name and Title */}
                  <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-purple-800 mb-2 sm:mb-3 leading-tight">
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
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600" />
                        <span className="font-medium text-xs sm:text-sm">{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-yellow-500 fill-current" />
                      <span className="font-medium text-xs sm:text-sm">5.0 ⭐ (24 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-purple-100 rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-700 text-xs sm:text-sm">Available now</span>
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
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                  onClick={() => {
                    console.log('Primary CTA clicked, services.length:', services.length);
                    // If there's only one service, go directly to booking
                    if (services.length === 1) {
                      const bookingUrl = `/profile/${profileId}/book/${services[0].id}`;
                      console.log('Single service - navigating to:', bookingUrl);
                      navigate(bookingUrl);
                    } else {
                      // Scroll to services section
                      console.log('Multiple services - scrolling to services section');
                      document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
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

      {/* Main Content */}
      <div className="bg-gray-50/50">

        {/* Services Section */}
        {services.length > 0 && (
          <div id="services-section" className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-16 max-w-7xl">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-800 mb-2 sm:mb-4">
                Services & Pricing
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                Professional beauty treatments tailored to your unique needs
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                {services.length} services available
              </p>
            </div>

            {/* Category Filter (Portfolio Style) */}
            {serviceCategories.length > 0 && (
              <div className="flex justify-center mb-8 sm:mb-12">
                <div className="bg-white rounded-full p-2 shadow-lg border border-gray-100 max-w-full overflow-hidden">
                  <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide px-2">
                    <Button
                      variant={serviceCategory === 'all' ? "default" : "ghost"}
                      size="sm"
                      className={`${serviceCategory === 'all' 
                        ? "bg-purple-600 hover:bg-purple-700 text-white rounded-full" 
                        : "rounded-full hover:bg-gray-100"
                      } whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2`}
                      onClick={() => {
                        setServiceCategory('all');
                        setCurrentServicePage(1);
                      }}
                    >
                      All Services ({services.length})
                    </Button>
                    {serviceCategories.map((category) => {
                      const count = services.filter(service => service.specialties?.name === category).length;
                      return (
                        <Button
                          key={category}
                          variant={serviceCategory === category ? "default" : "ghost"}
                          size="sm"
                          className={`${serviceCategory === category 
                            ? "bg-purple-600 hover:bg-purple-700 text-white rounded-full" 
                            : "rounded-full hover:bg-gray-100"
                          } whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2`}
                          onClick={() => {
                            setServiceCategory(category);
                            setCurrentServicePage(1);
                          }}
                        >
                          {category} ({count})
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Search and Filters - Only show for large lists */}
            {services.length > 8 && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 mb-8 sm:mb-12">
                <div className="flex flex-col gap-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchQuery}
                      onChange={(e) => {
                        setServiceSearchQuery(e.target.value);
                        setCurrentServicePage(1);
                      }}
                      className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  {/* Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Price Range Filter */}
                    <select
                      value={priceRange}
                      onChange={(e) => {
                        setPriceRange(e.target.value);
                        setCurrentServicePage(1);
                      }}
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Prices</option>
                      <option value="0-5000">Under ₦5,000</option>
                      <option value="5000-15000">₦5,000 - ₦15,000</option>
                      <option value="15000-30000">₦15,000 - ₦30,000</option>
                      <option value="30000-50000">₦30,000 - ₦50,000</option>
                      <option value="50000">₦50,000+</option>
                    </select>

                    {/* Sort By */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="name">Sort A-Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="duration-short">Duration: Short to Long</option>
                      <option value="duration-long">Duration: Long to Short</option>
                    </select>
                  </div>

                  {/* Results Summary */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Showing {paginatedServices.length} of {filteredServices.length} services
                        {serviceSearchQuery && (
                          <span className="ml-2 text-purple-600">for "{serviceSearchQuery}"</span>
                        )}
                      </p>
                      {(serviceCategory !== 'all' || priceRange !== 'all' || serviceSearchQuery) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setServiceSearchQuery('');
                            setServiceCategory('all');
                            setPriceRange('all');
                            setSortBy('name');
                            setCurrentServicePage(1);
                          }}
                          className="text-purple-600 hover:text-purple-700 p-0 h-auto text-xs sm:text-sm"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No services found</h3>
                <p className="text-gray-600 mb-4">
                  {serviceSearchQuery 
                    ? `No services match your search for "${serviceSearchQuery}"`
                    : 'No services match your current filters'
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setServiceSearchQuery('');
                    setServiceCategory('all');
                    setPriceRange('all');
                    setSortBy('name');
                    setCurrentServicePage(1);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedServices.map((service, index) => (
                <div 
                  key={service.id} 
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
                      <div className="h-32 sm:h-40 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                        <Image className="w-8 h-8 sm:w-12 sm:h-12 text-purple-300" />
                      </div>
                    )}
                    
                    {/* Price Badge */}
                    {service.price && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm rounded-full px-2 py-0.5 sm:px-3 sm:py-1 shadow-lg">
                        <span className="text-sm sm:text-lg font-bold text-purple-600 flex items-center">
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
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        {service.specialties && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs px-2 py-0.5">
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
                        onClick={() => {
                          setSelectedService(service);
                          setShowServiceDetails(true);
                        }}
                      >
                        <Info className="w-3 h-3" />
                        Details
                      </Button>
                      <Button 
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all duration-300"
                        onClick={() => {
                          console.log('Book Now clicked for service:', service.id, 'profileId:', profileId);
                          const bookingUrl = `/profile/${profileId}/book/${service.id}`;
                          console.log('Navigating to:', bookingUrl);
                          navigate(bookingUrl);
                        }}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
                </div>

                {/* Pagination */}
                {totalServicePages > 1 && (
                  <div className="mt-8 sm:mt-12 lg:mt-16 flex justify-center px-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {/* Previous Button */}
                      <Button
                        variant="outline"
                        disabled={currentServicePage === 1}
                        onClick={() => setCurrentServicePage(prev => Math.max(1, prev - 1))}
                        className="rounded-full text-xs sm:text-sm px-3 sm:px-4 py-2"
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalServicePages }, (_, i) => i + 1).map((page) => {
                          const isCurrentPage = page === currentServicePage;
                          const showPage = 
                            page === 1 || 
                            page === totalServicePages || 
                            (page >= currentServicePage - 1 && page <= currentServicePage + 1);

                          if (!showPage) {
                            if (page === currentServicePage - 2 || page === currentServicePage + 2) {
                              return (
                                <span key={page} className="px-2 text-gray-400">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <Button
                              key={page}
                              variant={isCurrentPage ? "default" : "ghost"}
                              size="sm"
                              onClick={() => setCurrentServicePage(page)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm ${
                                isCurrentPage 
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <Button
                        variant="outline"
                        disabled={currentServicePage === totalServicePages}
                        onClick={() => setCurrentServicePage(prev => Math.min(totalServicePages, prev + 1))}
                        className="rounded-full text-xs sm:text-sm px-3 sm:px-4 py-2"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Portfolio Section */}
        {portfolioItems.length > 0 && (
          <div className="container mx-auto px-4 py-16 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-purple-800 mb-4">
                Portfolio Gallery
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover the artistry and precision in every transformation
              </p>
            </div>
            
            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex justify-center mb-12">
                <div className="bg-white rounded-full p-2 shadow-lg border border-gray-100">
                  <div className="flex gap-2 overflow-x-auto">
                    <Button
                      variant={selectedCategory === 'all' ? "default" : "ghost"}
                      size="lg"
                      className={selectedCategory === 'all' 
                        ? "bg-purple-600 hover:bg-purple-700 text-white rounded-full" 
                        : "rounded-full hover:bg-gray-100"
                      }
                      onClick={() => setSelectedCategory('all')}
                    >
                      All Work ({portfolioItems.length})
                    </Button>
                    {categories.map((category) => {
                      const count = portfolioItems.filter(item => item.specialties?.name === category).length;
                      return (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "ghost"}
                          size="lg"
                          className={selectedCategory === category 
                            ? "bg-purple-600 hover:bg-purple-700 text-white rounded-full" 
                            : "rounded-full hover:bg-gray-100"
                          }
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category} ({count})
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Grid Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPortfolio.map((item, index) => (
                <div 
                  key={item.id} 
                  className="relative group cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Featured Badge */}
                      {item.is_featured && (
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-yellow-500 text-white shadow-lg text-xs">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300">
                        <div className="absolute inset-0 flex flex-col justify-end p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="font-bold text-sm mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-gray-200 mb-2 line-clamp-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                              {item.description}
                            </p>
                          )}
                          {item.specialties && (
                            <Badge variant="secondary" className="bg-purple-600 text-white text-xs w-fit transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-150">
                              {item.specialties.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View More Button */}
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full border-2 border-purple-200 text-purple-600 hover:bg-purple-600 hover:text-white hover:border-transparent transition-all duration-300 px-8 py-3"
              >
                View Full Portfolio
              </Button>
            </div>
          </div>
        )}
        
        {/* Contact Section */}
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
                  onClick={() => {
                    // If there's only one service, go directly to booking
                    if (services.length === 1) {
                      navigate(`/profile/${profileId}/book/${services[0].id}`);
                    } else {
                      // Scroll to services section
                      document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
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
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50">
        <Button
          size="lg"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-bounce"
          onClick={() => {
            // If there's only one service, go directly to booking
            if (services.length === 1) {
              navigate(`/profile/${profileId}/book/${services[0].id}`);
            } else {
              // Scroll to services section
              document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
        </Button>
      </div>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={selectedService}
        isOpen={showServiceDetails}
        onClose={() => {
          setShowServiceDetails(false);
          setSelectedService(null);
        }}
        onBookNow={() => {
          if (selectedService) {
            navigate(`/profile/${profileId}/book/${selectedService.id}`);
          }
        }}
      />
    </div>
  );
};
