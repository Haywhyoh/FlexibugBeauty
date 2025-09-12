
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star, Eye, ChevronLeft, ChevronRight, Image, Plus } from "lucide-react";

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
  specialty_id: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
  created_at: string;
  likes?: number;
  views?: number;
  portfolio_images?: PortfolioImage[];
}

interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

interface PortfolioItemCardProps {
  item: PortfolioItem;
  specialties: Specialty[];
  onUpdate: (id: string, updates: Partial<PortfolioItem>) => void;
  onDelete: (id: string, imageUrl: string) => void;
  variant?: 'featured' | 'masonry' | 'default';
}

export const PortfolioItemCard = ({ item, specialties, onUpdate, onDelete, variant = 'default' }: PortfolioItemCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  const [specialtyId, setSpecialtyId] = useState(item.specialty_id || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  
  // Get images from portfolio_images or fallback to single image_url
  const images = item.portfolio_images && item.portfolio_images.length > 0 
    ? item.portfolio_images.map(img => ({
        id: img.id,
        url: img.image_url,
        alt: img.alt_text || item.title,
        isPrimary: img.is_primary
      }))
    : item.image_url 
    ? [{
        id: 'legacy',
        url: item.image_url,
        alt: item.title,
        isPrimary: true
      }]
    : [];
  
  const hasMultipleImages = images.length > 1;

  const handleSave = () => {
    onUpdate(item.id, {
      title,
      description: description || null,
      specialty_id: specialtyId || null,
    });
    setIsEditing(false);
  };

  const toggleFeatured = () => {
    onUpdate(item.id, { is_featured: !item.is_featured });
  };
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-preview functionality on hover
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isHovered && hasMultipleImages && variant !== 'masonry') {
      intervalId = setInterval(() => {
        setPreviewIndex((prev) => (prev + 1) % images.length);
      }, 1500); // Change image every 1.5 seconds
    } else {
      setPreviewIndex(currentImageIndex);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isHovered, hasMultipleImages, images.length, currentImageIndex, variant]);

  // Get card height based on variant
  const getCardHeight = () => {
    if (variant === 'featured') return 'h-64 sm:h-72 lg:h-80';
    if (variant === 'masonry') return 'h-auto';
    return 'h-40 sm:h-48 md:h-40 lg:h-48';
  };

  // Get image container classes based on variant
  const getImageContainerClasses = () => {
    if (variant === 'masonry') {
      // For masonry, use min height and let content determine height
      return 'w-full min-h-[200px] max-h-[400px] overflow-hidden';
    }
    if (variant === 'featured') {
      return 'w-full h-64 sm:h-72 lg:h-80 overflow-hidden';
    }
    return 'w-full h-40 sm:h-48 md:h-40 lg:h-48 overflow-hidden';
  };

  return (
    <Card 
      className={`bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group w-full overflow-hidden ${
        variant === 'featured' ? 'ring-2 ring-purple-200 hover:ring-purple-300' : 'hover:shadow-lg'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0 w-full">
        <div className="relative overflow-hidden rounded-t-lg w-full">
          <div className={getImageContainerClasses()}>
            {images.length > 0 ? (
              <>
                <img
                  src={images[isHovered && hasMultipleImages ? previewIndex : currentImageIndex]?.url}
                  alt={images[isHovered && hasMultipleImages ? previewIndex : currentImageIndex]?.alt || item.title}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
                    variant === 'masonry' ? 'object-cover' : 'object-cover'
                  }`}
                  style={variant === 'masonry' ? { height: 'auto', minHeight: '200px' } : undefined}
                />
                
                {/* Auto-preview overlay for hover */}
                {isHovered && hasMultipleImages && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                )}
                
                {/* Image Navigation Arrows - only show if multiple images */}
                {hasMultipleImages && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
                
                {/* Enhanced Image Counter and Info */}
                {hasMultipleImages && (
                  <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1">
                    <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {(isHovered ? previewIndex : currentImageIndex) + 1} / {images.length}
                    </div>
                    {variant !== 'masonry' && (
                      <div className="bg-purple-600/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                        <Image className="w-3 h-3" />
                        <span>Gallery</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Image className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">No images</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Badge System */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
            {item.is_featured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 shadow-lg">
                <Star className="w-3 h-3 mr-1 fill-current" />
                <span className="hidden sm:inline font-medium">Featured</span>
              </Badge>
            )}
            {item.specialty_id && (
              <Badge className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs px-2 py-1 max-w-[calc(100%-2rem)] truncate shadow-sm">
                {specialties.find(s => s.id === item.specialty_id)?.name}
              </Badge>
            )}
          </div>

          {/* Portfolio Stats - Better positioned */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
            <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{item.views || 0}</span>
            </div>
            <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>{item.likes || 0}</span>
            </div>
          </div>

          {/* Hover Overlay with Action Buttons */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center z-10">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1 sm:gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
                <Edit className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={toggleFeatured}
                className={`h-8 w-8 p-0 ${item.is_featured ? "text-yellow-500" : ""}`}
              >
                <Star className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onDelete(item.id, images[0]?.url || '')}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced dots indicator with preview functionality */}
          {hasMultipleImages && variant !== 'masonry' && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  onMouseEnter={() => setPreviewIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 backdrop-blur-sm ${
                    index === (isHovered ? previewIndex : currentImageIndex)
                      ? 'bg-white shadow-lg scale-125' 
                      : 'bg-white/60 hover:bg-white/80 hover:scale-110'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 w-full">
          {isEditing ? (
            <div className="space-y-3 w-full">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Portfolio item title"
                className="text-sm w-full"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                rows={2}
                className="text-sm w-full resize-none"
              />
              <select
                value={specialtyId}
                onChange={(e) => setSpecialtyId(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="">Select category</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 w-full">
                <Button size="sm" onClick={handleSave} className="flex-1 text-xs">Save</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="flex-1 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base line-clamp-2 leading-tight">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              )}
              
              {/* Enhanced Footer with better layout */}
              <div className="flex items-center justify-between text-xs text-gray-500 mt-3 w-full pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {hasMultipleImages && (
                    <span className="flex items-center gap-1 text-purple-600 font-medium">
                      <Image className="w-3 h-3" />
                      <span>{images.length} photos</span>
                    </span>
                  )}
                  {variant === 'featured' && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">Featured</span>
                    </span>
                  )}
                </div>
                <span className="text-xs flex-shrink-0 ml-2 text-gray-400">
                  {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
