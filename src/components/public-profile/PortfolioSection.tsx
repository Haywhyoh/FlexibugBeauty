import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PortfolioItem } from "./PortfolioItem";

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

interface PortfolioSectionProps {
  portfolioItems: PortfolioItem[];
  onItemClick: (item: PortfolioItem, imageIndex: number) => void;
}

export const PortfolioSection = ({ portfolioItems, onItemClick }: PortfolioSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories from portfolio items
  const categories = Array.from(
    new Set(portfolioItems.map(item => item.specialties?.name).filter(Boolean))
  );

  const filteredPortfolio = selectedCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.specialties?.name === selectedCategory);

  if (portfolioItems.length === 0) {
    return null;
  }

  return (
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

      {/* Portfolio Masonry Grid Gallery */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {filteredPortfolio.map((item, index) => (
          <PortfolioItem
            key={item.id}
            item={item}
            index={index}
            onItemClick={onItemClick}
          />
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
  );
};
