
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, Images } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  specialty_id: string | null;
  is_featured: boolean | null;
  sort_order: number | null;
  created_at: string;
}

interface PortfolioHeaderProps {
  onUploadClick: () => void;
  uploading: boolean;
  portfolioItems?: PortfolioItem[];
}

export const PortfolioHeader = ({ onUploadClick, uploading, portfolioItems = [] }: PortfolioHeaderProps) => {
  return (
    <div className="space-y-6 w-full">
      {/* Main Header Section */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between w-full">
        <div className="text-center sm:text-left min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent leading-tight">
            Portfolio Management
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">
            Upload and organize your portfolio images to showcase your work
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <Button 
            disabled={uploading} 
            onClick={onUploadClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Images"}
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Images className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">Your Portfolio</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                  {portfolioItems.length === 0 
                    ? "Start by uploading your first portfolio images" 
                    : `${portfolioItems.length} portfolio ${portfolioItems.length === 1 ? 'item' : 'items'}`
                  }
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{portfolioItems.length}</p>
                <p className="text-xs text-gray-500">Items</p>
              </div>
            </div>
          </div>

          {/* Upload Tips */}
          {portfolioItems.length === 0 && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div className="text-sm text-purple-700">
                  <p className="font-medium mb-1">Pro tip:</p>
                  <p>You can upload multiple images at once to create rich portfolio galleries that showcase your work from different angles.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
