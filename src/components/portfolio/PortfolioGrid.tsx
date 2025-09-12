
import { PortfolioItemCard } from "./PortfolioItemCard";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  specialty_id: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
  created_at: string;
}

interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

interface PortfolioGridProps {
  items: PortfolioItem[];
  specialties: Specialty[];
  onUpdate: (id: string, updates: Partial<PortfolioItem>) => void;
  onDelete: (id: string, imageUrl: string) => void;
}

export const PortfolioGrid = ({ items, specialties, onUpdate, onDelete }: PortfolioGridProps) => {
  // Separate featured and regular items
  const featuredItems = items.filter(item => item.is_featured);
  const regularItems = items.filter(item => !item.is_featured);

  return (
    <div className="w-full space-y-6">
      {/* Featured Section */}
      {featuredItems.length > 0 && (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Featured Work</h3>
            <div className="h-px bg-gradient-to-r from-purple-300 to-transparent flex-1"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            {featuredItems.map((item) => (
              <PortfolioItemCard
                key={item.id}
                item={item}
                specialties={specialties}
                onUpdate={onUpdate}
                onDelete={onDelete}
                variant="featured"
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Portfolio - Masonry Layout */}
      {regularItems.length > 0 && (
        <div className="w-full">
          {featuredItems.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Portfolio</h3>
              <div className="h-px bg-gradient-to-r from-purple-300 to-transparent flex-1"></div>
            </div>
          )}
          <div className="columns-1 xs:columns-2 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 2xl:columns-5 gap-3 sm:gap-4 lg:gap-6 space-y-3 sm:space-y-4 lg:space-y-6">
            {regularItems.map((item) => (
              <div key={item.id} className="break-inside-avoid w-full">
                <PortfolioItemCard
                  item={item}
                  specialties={specialties}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  variant="masonry"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
