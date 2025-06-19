import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dashboard } from "@/components/Dashboard";
import { CalendarView } from "@/components/CalendarView";
import { MessagesView } from "@/components/MessagesView";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ClientsView } from "@/components/ClientsView";
import { LeadsView } from "@/components/LeadsView";
import { PortfolioManager } from "@/components/PortfolioManager";
import { ServicesManager } from "@/components/ServicesManager";
import { AvailabilityManager } from "@/components/AvailabilityManager";
import EmailNotificationSettings from "@/components/EmailNotificationSettings";
import SettingsView from "@/components/SettingsView";
import { Sidebar } from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import { ClientDashboard } from "@/components/ClientDashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  // Check if user is a client
  const isClient = user?.user_metadata?.user_type === 'client';

  // If user is a client, show the client dashboard
  if (isClient) {
    return <ClientDashboard />;
  }

  // Existing beauty professional dashboard
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewChange={setCurrentView} />;
      case "calendar":
        return <CalendarView />;
      case "messages":
        return <MessagesView />;
      case "clients":
        return <ClientsView />;
      case "leads":
        return <LeadsView />;
      case "portfolio":
        return <PortfolioManager />;
      case "services":
        return <ServicesManager />;
      case "availability":
        return <AvailabilityManager />;
      case "profile":
        return <ProfileEditor />;
      case "email-settings":
        return <EmailNotificationSettings />;
      case "settings":
      case "branding-settings":
      case "business-settings":
      case "payment-settings":
      case "notification-settings":
        return <SettingsView currentView={currentView} onViewChange={setCurrentView} />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="flex h-screen">
        {/* Sidebar - Only visible on md+ screens */}
        <Sidebar 
          activeView={currentView} 
          onViewChange={setCurrentView}
        />
        
        {/* Main Content Area - Adjust margin for sidebar on md+ screens */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-64">
          {/* Mobile Navigation - Only visible on small screens */}
          <MobileNavigation 
            currentView={currentView} 
            setCurrentView={setCurrentView}
            onLogout={handleLogout}
          />
          
          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto">
              {renderView()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
