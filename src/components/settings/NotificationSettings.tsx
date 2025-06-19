
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, Calendar, Users } from "lucide-react";

const NotificationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState({
    newBookings: true,
    cancellations: true,
    reminders: false,
    messages: true,
    reviews: true
  });

  const [pushNotifications, setPushNotifications] = useState({
    newBookings: true,
    cancellations: true,
    reminders: true,
    messages: true,
    reviews: false
  });

  const [smsNotifications, setSmsNotifications] = useState({
    newBookings: false,
    cancellations: true,
    reminders: true,
    messages: false,
    reviews: false
  });

  const handleEmailChange = (key: string, value: boolean) => {
    setEmailNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePushChange = (key: string, value: boolean) => {
    setPushNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSmsChange = (key: string, value: boolean) => {
    setSmsNotifications(prev => ({ ...prev, [key]: value }));
  };

  const notificationTypes = [
    {
      key: "newBookings",
      label: "New Bookings",
      description: "When someone books an appointment",
      icon: Calendar
    },
    {
      key: "cancellations",
      label: "Cancellations",
      description: "When appointments are cancelled or rescheduled",
      icon: Calendar
    },
    {
      key: "reminders",
      label: "Appointment Reminders",
      description: "Reminders about upcoming appointments",
      icon: Bell
    },
    {
      key: "messages",
      label: "New Messages",
      description: "When clients send you messages",
      icon: MessageSquare
    },
    {
      key: "reviews",
      label: "Reviews & Feedback",
      description: "When clients leave reviews",
      icon: Users
    }
  ];

  return (
    <div className="h-full">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Notification Settings
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Choose how and when you want to receive notifications
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <span>Email Notifications</span>
                </CardTitle>
                <CardDescription>
                  Receive notifications via email to stay updated on your business.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-3 mb-3 sm:mb-0 flex-1">
                          <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{type.label}</h3>
                            <p className="text-xs sm:text-sm text-gray-500">{type.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={emailNotifications[type.key as keyof typeof emailNotifications]}
                          onCheckedChange={(checked) => handleEmailChange(type.key, checked)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-primary-600" />
                  <span>Push Notifications</span>
                </CardTitle>
                <CardDescription>
                  Get instant notifications on your device when important events happen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-3 mb-3 sm:mb-0 flex-1">
                          <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{type.label}</h3>
                            <p className="text-xs sm:text-sm text-gray-500">{type.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={pushNotifications[type.key as keyof typeof pushNotifications]}
                          onCheckedChange={(checked) => handlePushChange(type.key, checked)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* SMS Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  <span>SMS Notifications</span>
                </CardTitle>
                <CardDescription>
                  Receive text messages for urgent notifications. Standard messaging rates apply.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <div key={type.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start space-x-3 mb-3 sm:mb-0 flex-1">
                          <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{type.label}</h3>
                            <p className="text-xs sm:text-sm text-gray-500">{type.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={smsNotifications[type.key as keyof typeof smsNotifications]}
                          onCheckedChange={(checked) => handleSmsChange(type.key, checked)}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                Save Notification Settings
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                Reset to Default
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
