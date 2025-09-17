import { Badge } from "@/components/ui/badge";
import { Star, Image } from "lucide-react";

interface PortfolioImage {
  id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean | null;
  alt_text: string | null;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  specialties: { name: string } | null;
  is_featured: boolean | null;
  portfolio_images?: PortfolioImage[];
}

interface PortfolioItemProps {
  item: PortfolioItem;
  index: number;
  onItemClick: (item: PortfolioItem, imageIndex: number) => void;
}

export const PortfolioItem = ({ item, index, onItemClick }: PortfolioItemProps) => {
  // Get primary image or first image
  const primaryImage = item.portfolio_images?.find(img => img.is_primary) || item.portfolio_images?.[0];
  const displayImage = primaryImage?.image_url || item.image_url;
  const imageCount = item.portfolio_images?.length || (item.image_url ? 1 : 0);

  return (
    <div 
      className="relative group cursor-pointer break-inside-avoid mb-4"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onItemClick(item, 0)}
    >
      <div className="relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={displayImage}
            alt={item.title}
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          
          {/* Image Count Badge */}
          {imageCount > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              <Image className="w-3 h-3 inline mr-1" />
              {imageCount}
            </div>
          )}
          
          {/* Featured Badge */}
          {item.is_featured && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-yellow-500 text-white shadow-lg text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Featured
              </Badge>
            </div>
          )}
          
          {/* Hover Overlay */}
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
              {imageCount > 1 && (
                <div className="text-xs text-gray-300 mt-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-200">
                  Click to view {imageCount} images
                </div>
              )}
            </div>
          </div>
          
          {/* Click to view indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Image className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

