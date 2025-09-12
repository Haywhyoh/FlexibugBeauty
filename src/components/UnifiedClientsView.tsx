import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  MessageSquare, 
  TrendingUp, 
  UserPlus,
  UserCheck,
  Clock,
  DollarSign,
  Eye
} from "lucide-react";
import { useUnifiedClients, UnifiedClient } from "@/hooks/useUnifiedClients";
import { CreateClientDialog } from "./CreateClientDialog";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const UnifiedClientsView = () => {
  const { clients, isLoading, inviteGuestClient, updateClientNotes } = useUnifiedClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<UnifiedClient | null>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notes, setNotes] = useState("");

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "registered") return matchesSearch && client.type === 'registered';
    if (activeTab === "guest") return matchesSearch && client.type === 'guest';
    if (activeTab === "vip") return matchesSearch && client.totalSpent >= 500;
    if (activeTab === "new") return matchesSearch && client.totalBookings <= 2;
    
    return matchesSearch;
  });

  const stats = {
    total: clients.length,
    registered: clients.filter(c => c.type === 'registered').length,
    guest: clients.filter(c => c.type === 'guest').length,
    vip: clients.filter(c => c.totalSpent >= 500).length,
    new: clients.filter(c => c.totalBookings <= 2).length,
    canInvite: clients.filter(c => c.type === 'guest' && c.canInvite).length
  };

  const getClientTypeInfo = (client: UnifiedClient) => {
    if (client.type === 'guest') {
      if (client.isConverted) {
        return { label: "Converted", color: "bg-green-100 text-green-800", icon: UserCheck };
      }
      return { label: "Guest", color: "bg-orange-100 text-orange-800", icon: UserPlus };
    }
    
    if (client.totalSpent >= 500) {
      return { label: "VIP", color: "bg-purple-100 text-purple-800", icon: Star };
    }
    
    if (client.totalBookings <= 2) {
      return { label: "New", color: "bg-blue-100 text-blue-800", icon: Plus };
    }
    
    return { label: "Regular", color: "bg-gray-100 text-gray-800", icon: Users };
  };

  const handleInviteClient = async (client: UnifiedClient) => {
    if (client.type === 'guest' && client.canInvite) {
      await inviteGuestClient(client.id);
    }
  };

  const handleShowNotes = (client: UnifiedClient) => {
    setSelectedClient(client);
    setNotes(client.notes || "");
    setShowNotesDialog(true);
  };

  const handleSaveNotes = async () => {
    if (selectedClient) {
      const success = await updateClientNotes(selectedClient, notes);
      if (success) {
        setShowNotesDialog(false);
        setSelectedClient(null);
        setNotes("");
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage both registered and guest clients</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-600">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.registered}</p>
                <p className="text-xs text-gray-600">Registered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.guest}</p>
                <p className="text-xs text-gray-600">Guest</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.vip}</p>
                <p className="text-xs text-gray-600">VIP</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Plus className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-xs text-gray-600">New</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.canInvite}</p>
                <p className="text-xs text-gray-600">Can Invite</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Client Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="registered">Registered ({stats.registered})</TabsTrigger>
          <TabsTrigger value="guest">Guest ({stats.guest})</TabsTrigger>
          <TabsTrigger value="vip">VIP ({stats.vip})</TabsTrigger>
          <TabsTrigger value="new">New ({stats.new})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredClients.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? "Try adjusting your search terms." : "Start by adding your first client."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredClients.map((client) => {
                const typeInfo = getClientTypeInfo(client);
                const TypeIcon = typeInfo.icon;
                
                return (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                            <Badge className={typeInfo.color}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                            {client.type === 'guest' && client.isConverted && (
                              <Badge className="bg-green-100 text-green-800">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Converted
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              {client.email}
                            </div>
                            {client.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                {client.phone}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-gray-500">Bookings</p>
                              <p className="font-semibold">{client.totalBookings}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total Spent</p>
                              <p className="font-semibold">{formatCurrency(client.totalSpent)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Visit</p>
                              <p className="font-semibold">{formatDate(client.lastBookingDate)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {client.type === 'guest' && client.canInvite && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInviteClient(client)}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Invite
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowNotes(client)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Notes
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Client Dialog */}
      <CreateClientDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Client Notes</DialogTitle>
            <DialogDescription>
              Add or update notes for {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes here..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};