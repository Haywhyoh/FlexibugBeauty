import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download,
  Share2,
  Heart,
  Star,
  Calendar
} from "lucide-react";

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
  specialty_id: string | null;
  is_featured: boolean | null;
  created_at: string;
  portfolio_images?: PortfolioImage[];
  specialties?: { name: string };
}

interface PortfolioGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioItem: PortfolioItem | null;
  initialImageIndex?: number;
}

export const PortfolioGalleryModal = ({ 
  isOpen, 
  onClose, 
  portfolioItem, 
  initialImageIndex = 0 
}: PortfolioGalleryModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Reset state when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialImageIndex);
      setZoom(1);
      setRotation(0);
      setIsZoomed(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialImageIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          previousImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case 'r':
          rotate();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !portfolioItem) return null;

  const images = portfolioItem.portfolio_images || [];
  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
    resetZoom();
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    resetZoom();
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
    if (zoom <= 1) setIsZoomed(false);
  };

  const resetZoom = () => {
    setZoom(1);
    setRotation(0);
    setIsZoomed(false);
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.image_url;
      link.download = `${portfolioItem.title}-${currentImageIndex + 1}.jpg`;
      link.click();
    }
  };

  const handleShare = async () => {
    if (navigator.share && currentImage) {
      try {
        await navigator.share({
          title: portfolioItem.title,
          text: portfolioItem.description || '',
          url: currentImage.image_url,
        });
      } catch (err) {
        console.log('Sharing failed:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in-0 duration-300">
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="text-white">
                <h2 className="text-lg sm:text-xl font-bold">{portfolioItem.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {portfolioItem.specialties && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                      {portfolioItem.specialties.name}
                    </Badge>
                  )}
                  {portfolioItem.is_featured && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/20">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Image Container */}
        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
          {currentImage && (
            <div 
              className="relative max-w-full max-h-full transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            >
              <img
                src={currentImage.image_url}
                alt={currentImage.alt_text || portfolioItem.title}
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
                onDoubleClick={isZoomed ? resetZoom : zoomIn}
              />
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="lg"
              onClick={previousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 p-0 rounded-full backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 p-0 rounded-full backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent">
          <div className="p-4 sm:p-6">
            
            {/* Image Counter and Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="text-white text-sm">
                  {currentImageIndex + 1} of {images.length}
                </div>
                
                {/* Thumbnail Strip */}
                <div className="flex gap-2 overflow-x-auto max-w-full pb-2 scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        resetZoom();
                      }}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        index === currentImageIndex
                          ? 'border-white scale-110'
                          : 'border-white/50 hover:border-white/75'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || ''}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Zoom and Rotation Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                disabled={zoom <= 0.5}
                className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <div className="text-white text-sm px-3 py-1 bg-black/40 rounded-full min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                disabled={zoom >= 3}
                className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <div className="w-px h-6 bg-white/20 mx-2" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={rotate}
                className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              
              {isZoomed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetZoom}
                  className="text-white hover:bg-white/20 px-3 h-10 rounded-full text-sm"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Description */}
        {portfolioItem.description && (
          <div className="absolute bottom-20 left-4 right-4 max-w-md mx-auto">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-sm leading-relaxed">{portfolioItem.description}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-white/70">
                <Calendar className="w-3 h-3" />
                {new Date(portfolioItem.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};