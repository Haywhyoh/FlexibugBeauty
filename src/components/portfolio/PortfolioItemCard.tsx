
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star, Eye } from "lucide-react";

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
}

export const PortfolioItemCard = ({ item, specialties, onUpdate, onDelete }: PortfolioItemCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  const [specialtyId, setSpecialtyId] = useState(item.specialty_id || '');

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

  return (
    <Card className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200 group w-full overflow-hidden">
      <CardContent className="p-0 w-full">
        <div className="relative overflow-hidden rounded-t-lg w-full">
          <div className="w-full h-40 sm:h-48 md:h-40 lg:h-48 overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Featured Badge */}
          {item.is_featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1">
              <Star className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Featured</span>
            </Badge>
          )}

          {/* Specialty Badge */}
          {item.specialty_id && (
            <Badge className="absolute top-2 right-2 bg-white/90 text-gray-800 text-xs px-2 py-1 max-w-[calc(100%-5rem)] truncate">
              {specialties.find(s => s.id === item.specialty_id)?.name}
            </Badge>
          )}

          {/* Hover Overlay with Action Buttons */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
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
                onClick={() => onDelete(item.id, item.image_url)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
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
              
              {/* Stats and Date */}
              <div className="flex items-center justify-between text-xs text-gray-600 mt-3 w-full">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <span className="flex items-center gap-1 min-w-0">
                    <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                    <span className="truncate">{item.likes || 0}</span>
                  </span>
                  <span className="flex items-center gap-1 min-w-0">
                    <Eye className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{item.views || 0}</span>
                  </span>
                </div>
                <span className="text-xs flex-shrink-0 ml-2">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
