
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { NavigationItems } from "@/components/navigation/NavigationItems";
import { navigationItems } from "@/components/navigation/navigationConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const { signOut } = useAuth();
  const { profile, loading, getDisplayName, getUserInitials } = useUserProfile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const sidebarContent = (
    <>
      {/* App Logo/Title */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">FB</span>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Botglam
          </span>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary-100 text-primary-700 text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getDisplayName()}
            </p>
            {profile?.business_name && (
              <p className="text-xs text-gray-400 truncate">
                {profile.business_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Items - Scrollable with nearly invisible scrollbar */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar">
        <NavigationItems
          items={navigationItems}
          activeView={activeView}
          onViewChange={onViewChange}
          onMobileClose={() => setIsMobileOpen(false)}
        />
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 mt-auto flex-shrink-0">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar - Only show on medium screens and above */}
      <aside
        className={`
          hidden md:flex
          w-64
          bg-white
          shadow-lg
          border-r border-gray-200
          flex-col
          fixed
          inset-y-0 left-0
          z-30
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
