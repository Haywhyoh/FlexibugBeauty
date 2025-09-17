import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { BrandColors, defaultBrandColors } from "@/lib/brandColors";

interface FloatingActionButtonProps {
  onBookNow: () => void;
  brandColors?: BrandColors | null;
}

export const FloatingActionButton = ({ onBookNow, brandColors }: FloatingActionButtonProps) => {
  // Get brand colors or use defaults
  const colors = brandColors || defaultBrandColors;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50">
      <Button
        size="lg"
        className="text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-bounce"
        style={{
          backgroundColor: colors.primary,
          '--hover-bg': colors.primaryDark
        } as React.CSSProperties & { '--hover-bg': string }}
        onClick={onBookNow}
      >
        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
      </Button>
    </div>
  );
};

