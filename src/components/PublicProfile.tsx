
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Globe, Instagram, Star, Clock, DollarSign, Calendar, Facebook, Image, Search, Filter } from "lucide-react";
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
    image_url: string | null;
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
  
  // Service filtering and pagination states
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceCategory, setServiceCategory] = useState<string>('all');
  const [servicesPerPage] = useState(12);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

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
            onClose={() => setShowBooking(false)}
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-[50vh] bg-purple-100 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-200/50 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative container mx-auto px-4 pt-16 pb-24">
          {/* Floating Profile Card */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 transform hover:scale-[1.01] transition-all duration-300">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Profile Avatar */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-purple-600/20 rounded-full blur-lg"></div>
                  <Avatar className="relative w-40 h-40 border-4 border-white shadow-xl">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-5xl bg-purple-100">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status Indicator */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  {/* Name and Title */}
                  <div className="mb-6">
                    <h1 className="text-5xl lg:text-6xl font-bold text-purple-800 mb-3 leading-tight">
                      {profile.business_name || getDisplayName()}
                    </h1>
                    {profile.business_name && getDisplayName() !== profile.business_name && (
                      <p className="text-2xl text-gray-700 mb-2">{getDisplayName()}</p>
                    )}
                  </div>
                  
                  {/* Stats Row */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-gray-600 mb-6">
                    {profile.location && (
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">{profile.location}</span>
                      </div>
                    )}
                    {profile.years_experience && (
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium">{profile.years_experience} years experience</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-gray-700">Available now</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-lg text-gray-700 leading-relaxed mb-6 max-w-3xl">{profile.bio}</p>
                  )}

                  {/* Social Links and CTA */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    {profile.phone && (
                      <Button variant="outline" size="lg" className="rounded-full hover:scale-105 transition-transform">
                        <Phone className="w-5 h-5 mr-2" />
                        {profile.phone}
                      </Button>
                    )}
                    {profile.instagram_handle && (
                      <Button variant="outline" size="lg" className="rounded-full hover:scale-105 transition-transform" asChild>
                        <a href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          <Instagram className="w-5 h-5 mr-2" />
                          {profile.instagram_handle}
                        </a>
                      </Button>
                    )}
                    {profile.facebook_handle && (
                      <Button variant="outline" size="lg" className="rounded-full hover:scale-105 transition-transform" asChild>
                        <a href={`https://facebook.com/${profile.facebook_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          <Facebook className="w-5 h-5 mr-2" />
                          {profile.facebook_handle}
                        </a>
                      </Button>
                    )}
                    {profile.tiktok_handle && (
                      <Button variant="outline" size="lg" className="rounded-full hover:scale-105 transition-transform" asChild>
                        <a href={`https://tiktok.com/@${profile.tiktok_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                          </svg>
                          {profile.tiktok_handle}
                        </a>
                      </Button>
                    )}
                    {profile.website_url && (
                      <Button variant="outline" size="lg" className="rounded-full hover:scale-105 transition-transform" asChild>
                        <a href={profile.website_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-5 h-5 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Primary CTA */}
              <div className="mt-8 text-center">
                <Button 
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => setShowBooking(true)}
                >
                  <Calendar className="w-6 h-6 mr-3" />
                  Book Your Appointment Now
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
          <div className="container mx-auto px-4 py-16 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-purple-800 mb-4">
                Services & Pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Professional beauty treatments tailored to your unique needs
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {services.length} services available
              </p>
            </div>

            {/* Search and Filter Controls */}
            {services.length > 8 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-12">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search services..."
                        value={serviceSearchQuery}
                        onChange={(e) => {
                          setServiceSearchQuery(e.target.value);
                          setCurrentServicePage(1);
                        }}
                        className="pl-10 h-12 text-lg"
                      />
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex flex-wrap gap-3">
                    {/* Category Filter */}
                    {serviceCategories.length > 0 && (
                      <select
                        value={serviceCategory}
                        onChange={(e) => {
                          setServiceCategory(e.target.value);
                          setCurrentServicePage(1);
                        }}
                        className="px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All Categories</option>
                        {serviceCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Price Range Filter */}
                    <select
                      value={priceRange}
                      onChange={(e) => {
                        setPriceRange(e.target.value);
                        setCurrentServicePage(1);
                      }}
                      className="px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Prices</option>
                      <option value="0-50">Under ₦50</option>
                      <option value="50-100">₦50 - ₦100</option>
                      <option value="100-200">₦100 - ₦200</option>
                      <option value="200-500">₦200 - ₦500</option>
                      <option value="500">₦500+</option>
                    </select>

                    {/* Sort By */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="name">Sort A-Z</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="duration-short">Duration: Short to Long</option>
                      <option value="duration-long">Duration: Long to Short</option>
                    </select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {paginatedServices.length} of {filteredServices.length} services
                    {serviceSearchQuery && (
                      <span className="ml-2 text-purple-600">for "{serviceSearchQuery}"</span>
                    )}
                    {(serviceCategory !== 'all' || priceRange !== 'all') && (
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
                        className="ml-2 text-purple-600 hover:text-purple-700 p-0 h-auto"
                      >
                        Clear filters
                      </Button>
                    )}
                  </p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {paginatedServices.map((service, index) => (
                <div 
                  key={service.id} 
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Service Image */}
                  <div className="relative">
                    {service.image_url ? (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                        <Image className="w-12 h-12 text-purple-300" />
                      </div>
                    )}
                    
                    {/* Price Badge */}
                    {service.price && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <span className="text-lg font-bold text-purple-600 flex items-center">
                          ₦{service.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4">
                    {/* Service Header */}
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {service.specialties && (
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                            {service.specialties.name}
                          </Badge>
                        )}
                        {service.duration_minutes && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{service.duration_minutes}min</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Description */}
                    {service.description && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    
                    {/* Book Button */}
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 text-sm font-semibold transition-all duration-300"
                      onClick={() => setShowBooking(true)}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
                </div>

                {/* Pagination */}
                {totalServicePages > 1 && (
                  <div className="mt-16 flex justify-center">
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <Button
                        variant="outline"
                        disabled={currentServicePage === 1}
                        onClick={() => setCurrentServicePage(prev => Math.max(1, prev - 1))}
                        className="rounded-full"
                      >
                        Previous
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
                              className={`w-10 h-10 rounded-full ${
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
                        className="rounded-full"
                      >
                        Next
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
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <div className="bg-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-30 translate-y-30"></div>
            </div>
            
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Look?</h2>
              <p className="text-xl mb-8 opacity-90">
                Book your appointment today and experience professional beauty services that enhance your natural beauty.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-50 rounded-full px-8 py-4 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                  onClick={() => setShowBooking(true)}
                >
                  <Calendar className="w-6 h-6 mr-3" />
                  Book Appointment
                </Button>
                
                {profile.phone && (
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-purple-600 rounded-full px-8 py-4 text-lg font-semibold"
                    asChild
                  >
                    <a href={`tel:${profile.phone}`}>
                      <Phone className="w-6 h-6 mr-3" />
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
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          size="lg"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-bounce"
          onClick={() => setShowBooking(true)}
        >
          <Calendar className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
};
