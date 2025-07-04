
import {
  Home,
  User,
  Camera,
  Briefcase,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Mail,
  Palette,
  Building,
  CreditCard,
  Bell
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  submenu?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "profile", label: "Profile", icon: User },
  { id: "portfolio", label: "Portfolio", icon: Camera },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "clients", label: "Clients", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "leads", label: "Leads", icon: BarChart3 },
  { 
    id: "settings", 
    label: "Settings", 
    icon: Settings,
    submenu: [
      { id: "settings", label: "General Settings", icon: Settings },
      { id: "branding-settings", label: "Branding", icon: Palette },
      { id: "business-settings", label: "Business Info", icon: Building },
      { id: "payment-settings", label: "Payment", icon: CreditCard },
      { id: "notification-settings", label: "Notifications", icon: Bell },
      { id: "email-settings", label: "Email Settings", icon: Mail }
    ]
  },
];
