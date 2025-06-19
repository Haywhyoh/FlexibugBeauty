import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Plus, Phone, Mail, Calendar, Star, MessageSquare, TrendingUp } from "lucide-react";
import { useClientProfiles } from "@/hooks/useClientProfiles";
import { CreateClientDialog } from "./CreateClientDialog";
import { useState } from "react";

export const ClientsView = () => {
  const { clients, loading, updateClientNotes, refetchClients } = useClientProfiles();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredClients = clients.filter(client => {
    const name = client.display_name || client.profile?.full_name || '';
    const email = client.display_email || client.profile?.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "vip") return matchesSearch && client.total_spent >= 500;
    if (activeTab === "new") return matchesSearch && client.total_appointments <= 2;
    if (activeTab === "regular") return matchesSearch && client.total_appointments > 2 && client.total_spent < 500;
    
    return matchesSearch;
  });

  const stats = {
    total: clients.length,
    vip: clients.filter(c => c.total_spent >= 500).length,
    new: clients.filter(c => c.total_appointments <= 2).length,
    regular: clients.filter(c => c.total_appointments > 2 && c.total_spent < 500).length
  };

  const getClientType = (client: any) => {
    if (client.total_spent >= 500) return { label: "VIP", color: "bg-purple-100 text-purple-800" };
    if (client.total_appointments <= 2) return { label: "New", color: "bg-green-100 text-green-800" };
    return { label: "Regular", color: "bg-blue-100 text-blue-800" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header - Mobile optimized */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Client Management
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
                Manage your client relationships and history
              </p>
            </div>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-full md:w-auto"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Stats Cards - Mobile responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-purple-100">Total</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-pink-100">VIP</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.vip}</p>
                </div>
                <Star className="w-6 h-6 md:w-8 md:h-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-orange-100">New</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.new}</p>
                </div>
                <Plus className="w-6 h-6 md:w-8 md:h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-emerald-100">Regular</p>
                  <p className="text-lg md:text-2xl font-bold">{stats.regular}</p>
                </div>
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search clients..." 
                className="pl-10 h-10 md:h-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Tabs - Mobile optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="all" className="text-xs md:text-sm px-2 py-2">All</TabsTrigger>
            <TabsTrigger value="vip" className="text-xs md:text-sm px-2 py-2">VIP</TabsTrigger>
            <TabsTrigger value="new" className="text-xs md:text-sm px-2 py-2">New</TabsTrigger>
            <TabsTrigger value="regular" className="text-xs md:text-sm px-2 py-2">Regular</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3 md:space-y-4 mt-4">
            {filteredClients.length === 0 ? (
              <Card>
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="text-gray-500">
                    {searchTerm ? "No clients match your search" : "No clients yet"}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {filteredClients.map((client) => {
                  const clientType = getClientType(client);
                  const clientName = client.display_name || client.profile?.full_name || 'Unknown Client';
                  const clientEmail = client.display_email || client.profile?.email || '';
                  const clientPhone = client.display_phone || client.profile?.phone || '';
                  
                  return (
                    <Card key={client.id} className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-4 md:p-6">
                        {/* Mobile Layout */}
                        <div className="space-y-4">
                          {/* Client Header */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                              {clientName.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                <h3 className="text-base md:text-lg font-semibold truncate">{clientName}</h3>
                                <div className="flex flex-wrap gap-1">
                                  <Badge className={`${clientType.color} text-xs`}>
                                    {clientType.label}
                                  </Badge>
                                  {client.user_id && (
                                    <Badge variant="outline" className="text-xs">
                                      Linked Account
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contact Information - Mobile Stacked */}
                          <div className="space-y-2">
                            {clientEmail && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{clientEmail}</span>
                              </div>
                            )}
                            {clientPhone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>{clientPhone}</span>
                              </div>
                            )}
                          </div>

                          {/* Client Stats - Mobile Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex justify-between md:block">
                              <span className="text-gray-600">Client since:</span>
                              <span className="font-medium">{new Date(client.client_since).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between md:block">
                              <span className="text-gray-600">Total visits:</span>
                              <span className="font-medium">{client.total_appointments}</span>
                            </div>
                            <div className="flex justify-between md:block">
                              <span className="text-gray-600">Total spent:</span>
                              <span className="font-medium text-green-600">${client.total_spent}</span>
                            </div>
                          </div>

                          {/* Notes */}
                          {client.notes && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Notes:</span> {client.notes}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons - Mobile Full Width */}
                          <div className="flex flex-col md:flex-row gap-2 pt-2">
                            <Button variant="outline" size="sm" className="w-full md:w-auto">
                              <Calendar className="w-4 h-4 mr-1" />
                              Book
                            </Button>
                            <Button variant="outline" size="sm" className="w-full md:w-auto">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CreateClientDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onClientCreated={refetchClients}
        />
      </div>
    </div>
  );
};
