import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ServiceCard } from "./ServiceCard";
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

interface ServicesSectionProps {
  services: Service[];
  onViewServiceDetails: (service: Service) => void;
  onBookService: (service: Service) => void;
  brandColors?: BrandColors | null;
}

export const ServicesSection = ({ services, onViewServiceDetails, onBookService, brandColors }: ServicesSectionProps) => {
  // Get brand colors or use defaults
  const colors = brandColors || defaultBrandColors;
  const styles = getBrandInlineStyles(colors);

  // Service filtering and pagination states
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [serviceCategory, setServiceCategory] = useState<string>('all');
  const [servicesPerPage] = useState(12);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

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

  if (services.length === 0) {
    return null;
  }

  return (
    <div id="services-section" className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-16 max-w-7xl">
      <div className="text-center mb-8 sm:mb-12">
        <h2 
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4"
          style={styles.textPrimary}
        >
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
                  ? "text-white rounded-full" 
                  : "rounded-full hover:bg-gray-100"
                } whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2`}
                style={serviceCategory === 'all' ? styles.bgPrimary : {}}
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
                      ? "text-white rounded-full" 
                      : "rounded-full hover:bg-gray-100"
                    } whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2`}
                    style={serviceCategory === category ? styles.bgPrimary : {}}
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
                className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm bg-white focus:border-transparent"
                style={{ 
                  '--tw-ring-color': colors.primary,
                  '--tw-ring-offset-color': colors.background
                } as React.CSSProperties & { '--tw-ring-color': string; '--tw-ring-offset-color': string }}
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
                className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl text-xs sm:text-sm bg-white focus:border-transparent"
                style={{ 
                  '--tw-ring-color': colors.primary,
                  '--tw-ring-offset-color': colors.background
                } as React.CSSProperties & { '--tw-ring-color': string; '--tw-ring-offset-color': string }}
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
                    <span className="ml-2" style={styles.primary}>for "{serviceSearchQuery}"</span>
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
                    className="p-0 h-auto text-xs sm:text-sm"
                    style={styles.primary}
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
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                onViewDetails={onViewServiceDetails}
                onBookNow={onBookService}
                brandColors={colors}
              />
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
                            ? 'text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        style={isCurrentPage ? styles.bgPrimary : {}}
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
  );
};
