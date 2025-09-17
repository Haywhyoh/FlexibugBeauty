
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Building, CreditCard, Bell, Mail, Settings } from "lucide-react";

interface SettingsDashboardProps {
  onNavigate: (view: string) => void;
}

const SettingsDashboard = ({ onNavigate }: SettingsDashboardProps) => {
  const settingsCards = [
    {
      id: "branding-settings",
      title: "Branding",
      description: "Customize your brand colors, logo, and visual identity",
      icon: Palette,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "profile-settings", 
      title: "Profile & Business",
      description: "Manage your personal profile, business information, and contact details",
      icon: Building,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "payment-settings",
      title: "Payment Settings",
      description: "Manage payment methods, pricing, and billing preferences",
      icon: CreditCard,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "notification-settings",
      title: "Notifications",
      description: "Control how and when you receive notifications",
      icon: Bell,
      color: "from-orange-500 to-red-500"
    },
    {
      id: "email-settings",
      title: "Email Settings",
      description: "Configure email notifications and templates",
      icon: Mail,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="h-full">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Settings
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage your account settings and business preferences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {settingsCards.map((setting) => {
              const Icon = setting.icon;
              return (
                <Card 
                  key={setting.id} 
                  className="group hover:shadow-beauty-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary-200"
                  onClick={() => onNavigate(setting.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${setting.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {setting.title}
                        </CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-sm sm:text-base text-gray-600">
                      {setting.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:bg-primary-50 group-hover:border-primary-300 group-hover:text-primary-700 transition-colors"
                    >
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
