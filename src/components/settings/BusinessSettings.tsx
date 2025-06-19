
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building, Clock, MapPin, Phone, Mail } from "lucide-react";

const BusinessSettings = () => {
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "Beautiful Lashes Studio",
    description: "Premium lash extension services with a focus on natural beauty and client comfort.",
    address: "123 Beauty Street, Salon City, SC 12345",
    phone: "(555) 123-4567",
    email: "info@beautifullashes.com",
    website: "www.beautifullashes.com"
  });

  const [businessHours, setBusinessHours] = useState([
    { day: "Monday", open: "09:00", close: "17:00", closed: false },
    { day: "Tuesday", open: "09:00", close: "17:00", closed: false },
    { day: "Wednesday", open: "09:00", close: "17:00", closed: false },
    { day: "Thursday", open: "09:00", close: "19:00", closed: false },
    { day: "Friday", open: "09:00", close: "19:00", closed: false },
    { day: "Saturday", open: "10:00", close: "16:00", closed: false },
    { day: "Sunday", open: "10:00", close: "15:00", closed: true }
  ]);

  const handleBusinessInfoChange = (field: string, value: string) => {
    setBusinessInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHoursChange = (dayIndex: number, field: string, value: string | boolean) => {
    setBusinessHours(prev => prev.map((day, index) => 
      index === dayIndex ? { ...day, [field]: value } : day
    ));
  };

  return (
    <div className="h-full">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Business Information
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Update your business details and operating hours
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Basic Business Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-primary-600" />
                  <span>Business Details</span>
                </CardTitle>
                <CardDescription>
                  Basic information about your business that will appear on your public profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      value={businessInfo.businessName}
                      onChange={(e) => handleBusinessInfoChange('businessName', e.target.value)}
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={businessInfo.website}
                      onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
                      placeholder="www.yourbusiness.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={businessInfo.description}
                    onChange={(e) => handleBusinessInfoChange('description', e.target.value)}
                    placeholder="Describe your business and services..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-primary-600" />
                  <span>Contact Information</span>
                </CardTitle>
                <CardDescription>
                  How clients can reach you and find your business.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={businessInfo.phone}
                        onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={businessInfo.email}
                        onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                        placeholder="info@yourbusiness.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Textarea
                      id="address"
                      value={businessInfo.address}
                      onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                      placeholder="123 Business Street, City, State 12345"
                      rows={2}
                      className="pl-10 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span>Business Hours</span>
                </CardTitle>
                <CardDescription>
                  Set your operating hours for each day of the week.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {businessHours.map((day, index) => (
                    <div key={day.day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between sm:justify-start sm:w-24">
                        <span className="font-medium text-gray-700 text-sm sm:text-base">{day.day}</span>
                        <div className="flex items-center space-x-2 sm:hidden">
                          <span className="text-xs text-gray-500">Closed</span>
                          <input
                            type="checkbox"
                            checked={!day.closed}
                            onChange={(e) => handleHoursChange(index, 'closed', !e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      
                      <div className="hidden sm:flex sm:items-center sm:space-x-2">
                        <span className="text-sm text-gray-500">Closed</span>
                        <input
                          type="checkbox"
                          checked={!day.closed}
                          onChange={(e) => handleHoursChange(index, 'closed', !e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </div>

                      {!day.closed && (
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
                          <Input
                            type="time"
                            value={day.open}
                            onChange={(e) => handleHoursChange(index, 'open', e.target.value)}
                            className="w-full sm:w-auto"
                          />
                          <span className="text-gray-500 text-sm">to</span>
                          <Input
                            type="time"
                            value={day.close}
                            onChange={(e) => handleHoursChange(index, 'close', e.target.value)}
                            className="w-full sm:w-auto"
                          />
                        </div>
                      )}
                      
                      {day.closed && (
                        <div className="flex-1 text-center sm:text-left">
                          <span className="text-gray-500 text-sm sm:text-base">Closed</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                Save Business Settings
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;
