
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
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 w-full">
        {items.map((item) => (
          <PortfolioItemCard
            key={item.id}
            item={item}
            specialties={specialties}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
