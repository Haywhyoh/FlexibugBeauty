
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Plus, Edit, Trash2 } from "lucide-react";

export const ServicesView = () => {
  const services = [
    {
      id: 1,
      name: "Classic Lash Set",
      duration: "2 hours",
      price: 85,
      description: "Natural-looking individual lash extensions for everyday elegance",
      category: "Lash Extensions",
      active: true
    },
    {
      id: 2,
      name: "Volume Lash Set",
      duration: "2.5 hours", 
      price: 120,
      description: "Fuller, more dramatic look with multiple lightweight lashes per natural lash",
      category: "Lash Extensions",
      active: true
    },
    {
      id: 3,
      name: "Lash Fill (2-3 weeks)",
      duration: "1.5 hours",
      price: 65,
      description: "Maintenance appointment to fill in grown-out lash extensions",
      category: "Lash Maintenance",
      active: true
    },
    {
      id: 4,
      name: "Lash Removal",
      duration: "45 minutes",
      price: 25,
      description: "Professional and safe removal of lash extensions",
      category: "Lash Maintenance",
      active: true
    },
    {
      id: 5,
      name: "Lash Lift & Tint",
      duration: "1 hour",
      price: 55,
      description: "Curl and darken your natural lashes for a mascara-like effect",
      category: "Natural Lash Services",
      active: false
    },
  ];

  const categories = [...new Set(services.map(service => service.category))];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Services & Pricing
          </h1>
          <p className="text-gray-600 mt-2">Manage your service offerings and pricing</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services by Category */}
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services
              .filter(service => service.category === category)
              .map((service) => (
                <Card key={service.id} className={`bg-white/70 backdrop-blur-sm transition-all duration-200 hover:shadow-lg ${
                  !service.active ? 'opacity-60' : ''
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-purple-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{service.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-sm font-semibold">{service.price}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={service.active ? "default" : "secondary"}>
                        {service.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {/* Service Statistics */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">85%</div>
              <div className="text-sm text-gray-600">Most Popular Service</div>
              <div className="text-sm font-medium">Classic Lash Set</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">$95</div>
              <div className="text-sm text-gray-600">Average Service Value</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">2.1h</div>
              <div className="text-sm text-gray-600">Average Service Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
