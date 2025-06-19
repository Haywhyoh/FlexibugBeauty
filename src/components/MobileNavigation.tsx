
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationItems } from "@/components/navigation/navigationConfig";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MobileNavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onLogout: () => void;
}

const MobileNavigation = ({ currentView, setCurrentView, onLogout }: MobileNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['settings']); // Settings expanded by default
  const { profile, getDisplayName, getUserInitials } = useUserProfile();

  const handleMenuItemClick = (id: string, hasSubmenu: boolean = false) => {
    if (hasSubmenu) {
      setExpandedItems(prev => 
        prev.includes(id) 
          ? prev.filter(itemId => itemId !== id)
          : [...prev, id]
      );
    } else {
      setCurrentView(id);
      setIsMenuOpen(false);
    }
  };

  const isItemActive = (itemId: string, submenu?: any[]) => {
    if (currentView === itemId) return true;
    if (submenu) {
      return submenu.some(subItem => subItem.id === currentView);
    }
    return false;
  };

  return (
    <>
      {/* Mobile Header - Only show on small screens */}
      <header className="md:hidden bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              FlexiBug
            </span>
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay - Only show on small screens */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile Menu Drawer - Only show on small screens */}
      <div className={cn(
        "md:hidden fixed inset-y-0 left-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-purple-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FlexiBug
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isExpanded = expandedItems.includes(item.id);
                const isActive = isItemActive(item.id, item.submenu);
                
                return (
                  <li key={item.id}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left hover:bg-purple-100",
                        isActive && "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
                      )}
                      onClick={() => handleMenuItemClick(item.id, hasSubmenu)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
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
                          const isSubActive = currentView === subItem.id;
                          
                          return (
                            <Button
                              key={subItem.id}
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left text-sm hover:bg-purple-50",
                                isSubActive && "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
                              )}
                              onClick={() => handleMenuItemClick(subItem.id)}
                            >
                              <SubIcon className="w-4 h-4 mr-3" />
                              {subItem.label}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile & Settings */}
          <div className="p-4 border-t border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary-100 text-primary-700 text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-gray-800">{getDisplayName()}</div>
                <div className="text-sm text-gray-600">Professional</div>
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left hover:bg-red-100 text-red-600"
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
