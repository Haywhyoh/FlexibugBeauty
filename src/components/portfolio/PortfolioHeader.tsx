
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Share, Camera, Star, Eye, Link, Copy, ExternalLink } from "lucide-react";

interface PortfolioHeaderProps {
  onUploadClick: () => void;
  uploading: boolean;
  portfolioItems?: any[];
}

export const PortfolioHeader = ({ onUploadClick, uploading, portfolioItems = [] }: PortfolioHeaderProps) => {
  const stats = {
    totalImages: portfolioItems.length,
    totalLikes: portfolioItems.reduce((sum, item) => sum + (item.likes || 0), 0) || 1247,
    totalViews: portfolioItems.reduce((sum, item) => sum + (item.views || 0), 0) || 8956,
    monthlyGrowth: 23
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between w-full">
        <div className="text-center sm:text-left min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent leading-tight">
            Portfolio Management
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base lg:text-lg">Showcase your best work and attract new clients</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
          <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200">
            <Share className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Share Portfolio</span>
            <span className="sm:hidden">Share</span>
          </Button>
          <Button 
            disabled={uploading} 
            onClick={onUploadClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Add Photos"}
          </Button>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 w-full">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between w-full">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-purple-100 mb-1 truncate">Total Photos</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{stats.totalImages}</p>
              </div>
              <Camera className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-purple-200 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 w-full">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between w-full">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-pink-100 mb-1 truncate">Total Likes</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{stats.totalLikes}</p>
              </div>
              <Star className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-pink-200 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 w-full">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between w-full">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-orange-100 mb-1 truncate">Total Views</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-orange-200 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 w-full">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between w-full">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-emerald-100 mb-1 truncate">Growth This Month</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">+{stats.monthlyGrowth}%</p>
              </div>
              <Link className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-emerald-200 flex-shrink-0 ml-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio URL */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Link className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            Your Portfolio URL
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col space-y-3 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border w-full">
              <code className="flex-1 text-xs sm:text-sm text-gray-800 font-mono bg-white px-2 py-1 rounded border break-all min-w-0">
                https://flexibug.com/portfolio/sarah-chen-lashes
              </code>
              <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200">
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-200">
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-3">
            Share this link with clients to showcase your work and accept bookings
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
