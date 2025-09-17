import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ServiceDetailsModal } from "./ServiceDetailsModal";
import { PortfolioGalleryModal } from "./portfolio/PortfolioGalleryModal";
import { 
  HeroSection, 
  ServicesSection, 
  PortfolioSection, 
  ContactSection, 
  FloatingActionButton 
} from "./public-profile";

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
    business_hours: any;
    business_address: string | null;
    business_description: string | null;
    brand_colors?: any;
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
    portfolio_images?: Array<{
      id: string;
      image_url: string;
      sort_order: number;
      is_primary: boolean | null;
      alt_text: string | null;
    }>;
  }>;
}

export const PublicProfile = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedService, setSelectedService] = useState<PublicProfileData['services'][0] | null>(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PublicProfileData['portfolioItems'][0] | null>(null);
  const [showPortfolioGallery, setShowPortfolioGallery] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
        .select('*, brand_colors')
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

      // Fetch portfolio items with images
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolio_items')
        .select(`
          id,
          title,
          description,
          image_url,
          is_featured,
          created_at,
          specialties!specialty_id(name),
          portfolio_images(
            id,
            image_url,
            sort_order,
            is_primary,
            alt_text
          )
        `)
        .eq('user_id', profileData.id)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (portfolioError) throw portfolioError;

      // Sort portfolio images within each portfolio item
      const portfolioWithSortedImages = (portfolioData || []).map(item => ({
        ...item,
        portfolio_images: (item.portfolio_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
      }));

      setProfileData({
        profile: profileData,
        services: servicesData || [],
        portfolioItems: portfolioWithSortedImages,
      });
    } catch (error) {
      console.error('Error fetching public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleBookNow = () => {
    if (profileData?.services.length === 1) {
      const bookingUrl = `/profile/${profileId}/book/${profileData.services[0].id}`;
      navigate(bookingUrl);
    } else {
      document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleServiceBook = (service: PublicProfileData['services'][0]) => {
    const bookingUrl = `/profile/${profileId}/book/${service.id}`;
    navigate(bookingUrl);
  };

  const handleServiceDetails = (service: PublicProfileData['services'][0]) => {
    setSelectedService(service);
    setShowServiceDetails(true);
  };

  const handlePortfolioItemClick = (item: PublicProfileData['portfolioItems'][0], imageIndex: number) => {
    setSelectedPortfolioItem(item);
    setSelectedImageIndex(imageIndex);
    setShowPortfolioGallery(true);
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection 
        profile={profile} 
        servicesCount={services.length} 
        onBookNow={handleBookNow} 
      />

      {/* Main Content */}
      <div className="bg-gray-50/50">
        {/* Services Section */}
        <ServicesSection 
          services={services} 
          onViewServiceDetails={handleServiceDetails}
          onBookService={handleServiceBook}
          brandColors={profile.brand_colors}
        />

        {/* Portfolio Section */}
        <PortfolioSection 
          portfolioItems={portfolioItems} 
          onItemClick={handlePortfolioItemClick}
        />
        
        {/* Contact Section */}
        <ContactSection 
          profile={profile} 
          servicesCount={services.length} 
          onBookNow={handleBookNow} 
        />
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton 
        onBookNow={handleBookNow} 
        brandColors={profile.brand_colors}
      />

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

      {/* Portfolio Gallery Modal */}
      <PortfolioGalleryModal
        isOpen={showPortfolioGallery}
        onClose={() => {
          setShowPortfolioGallery(false);
          setSelectedPortfolioItem(null);
          setSelectedImageIndex(0);
        }}
        portfolioItem={selectedPortfolioItem}
        initialImageIndex={selectedImageIndex}
      />
    </div>
  );
};