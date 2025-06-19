import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface PortfolioFiltersProps {
  specialties: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  portfolioItems: Array<{
    specialty_id: string | null;
  }>;
  selectedSpecialty: string;
  onSpecialtyChange: (specialty: string) => void;
}

export const PortfolioFilters = ({ 
  specialties, 
  portfolioItems, 
  selectedSpecialty, 
  onSpecialtyChange 
}: PortfolioFiltersProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollability();
    }, 100);
    
    const handleResize = () => {
      setTimeout(checkScrollability, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [specialties]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current && !isScrolling) {
      setIsScrolling(true);
      const scrollAmount = Math.min(250, scrollRef.current.clientWidth * 0.7);
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      // Reset scrolling state after animation
      setTimeout(() => {
        setIsScrolling(false);
        checkScrollability();
      }, 300);
    }
  };

  const handleScroll = () => {
    if (!isScrolling) {
      checkScrollability();
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-3 sm:p-4">
        <div className="relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg h-8 w-8 p-0 rounded-full border border-gray-200 hover:border-purple-300 transition-all duration-200"
              onClick={() => scroll('left')}
              disabled={isScrolling}
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Button>
          )}

          {/* Scrollable container */}
          <div 
            ref={scrollRef}
            className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-0 sm:px-2"
            onScroll={handleScroll}
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              paddingLeft: canScrollLeft ? '2.5rem' : '0.5rem',
              paddingRight: canScrollRight ? '2.5rem' : '0.5rem',
            }}
          >
            <Button 
              variant={selectedSpecialty === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => onSpecialtyChange('all')}
              className={`whitespace-nowrap flex-shrink-0 min-w-fit text-xs sm:text-sm px-3 sm:px-4 py-2 transition-all duration-200 ${
                selectedSpecialty === 'all' 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md" 
                  : "hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
              }`}
            >
              All Work ({portfolioItems.length})
            </Button>
            {specialties.map((specialty) => {
              const count = portfolioItems.filter(item => item.specialty_id === specialty.id).length;
              return (
                <Button
                  key={specialty.id}
                  variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSpecialtyChange(specialty.id)}
                  className={`whitespace-nowrap flex-shrink-0 min-w-fit text-xs sm:text-sm px-3 sm:px-4 py-2 transition-all duration-200 ${
                    selectedSpecialty === specialty.id 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md" 
                      : "hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
                  }`}
                >
                  {specialty.name} ({count})
                </Button>
              );
            })}
          </div>

          {/* Right scroll button */}
          {canScrollRight && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg h-8 w-8 p-0 rounded-full border border-gray-200 hover:border-purple-300 transition-all duration-200"
              onClick={() => scroll('right')}
              disabled={isScrolling}
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
