import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Plus } from "lucide-react";

interface PortfolioEmptyStateProps {
  onUploadClick: () => void;
  uploading: boolean;
}

export const PortfolioEmptyState = ({ onUploadClick, uploading }: PortfolioEmptyStateProps) => {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-2 border-dashed border-purple-300 hover:border-purple-400 transition-colors">
      <CardContent className="p-6 lg:p-8 text-center">
        <Camera className="w-12 h-12 lg:w-16 lg:h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">Add New Photos</h3>
        <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">
          Create your first portfolio item with multiple images
        </p>
        <Button 
          onClick={onUploadClick}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
          disabled={uploading}
        >
          <Plus className="w-4 h-4 mr-2" />
          {uploading ? "Creating..." : "Create Portfolio"}
        </Button>
      </CardContent>
    </Card>
  );
};
