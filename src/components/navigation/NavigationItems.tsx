
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  submenu?: NavigationItem[];
}

interface NavigationItemsProps {
  items: NavigationItem[];
  activeView: string;
  onViewChange: (view: string) => void;
  onMobileClose?: () => void;
}

export const NavigationItems = ({ items, activeView, onViewChange, onMobileClose }: NavigationItemsProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['settings']); // Settings expanded by default

  const handleItemClick = (itemId: string, hasSubmenu: boolean = false) => {
    if (hasSubmenu) {
      setExpandedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      onViewChange(itemId);
      onMobileClose?.();
    }
  };

  const isItemActive = (itemId: string, submenu?: NavigationItem[]) => {
    if (activeView === itemId) return true;
    if (submenu) {
      return submenu.some(subItem => subItem.id === activeView);
    }
    return false;
  };

  return (
    <nav className="flex-1 p-4 space-y-2">
      {items.map((item) => {
        const Icon = item.icon;
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isExpanded = expandedItems.includes(item.id);
        const isActive = isItemActive(item.id, item.submenu);
        
        return (
          <div key={item.id}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              onClick={() => handleItemClick(item.id, hasSubmenu)}
              className={cn(
                "w-full justify-start",
                isActive 
                  ? "bg-primary-100 text-primary-700 hover:bg-primary-200" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {hasSubmenu && (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )
              )}
            </Button>
            
            {hasSubmenu && isExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {item.submenu!.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = activeView === subItem.id;
                  
                  return (
                    <Button
                      key={subItem.id}
                      variant={isSubActive ? "secondary" : "ghost"}
                      onClick={() => handleItemClick(subItem.id)}
                      className={cn(
                        "w-full justify-start text-sm",
                        isSubActive 
                          ? "bg-primary-100 text-primary-700 hover:bg-primary-200" 
                          : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                      )}
                    >
                      <SubIcon className="mr-3 h-3 w-3" />
                      {subItem.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
