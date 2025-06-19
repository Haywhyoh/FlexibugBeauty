
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Users, 
  UserPlus,
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Eye,
  Kanban,
  CheckSquare,
  BarChart3,
  Filter,
  Download
} from "lucide-react";
import { useLeadForms } from "@/hooks/useLeadForms";
import { useClientProfiles } from "@/hooks/useClientProfiles";
import { useFollowUpTasks } from "@/hooks/useFollowUpTasks";
import { FormTemplateData } from "@/types/form";
import { LeadFormBuilder } from "./LeadFormBuilder";
import { LeadFormTemplates } from "./LeadFormTemplates";
import { EnhancedLeadConversionDialog } from "./EnhancedLeadConversionDialog";
import { FormPreviewModal } from "./FormPreviewModal";
import { LeadPipeline } from "./LeadPipeline";
import { FollowUpTasksPanel } from "./FollowUpTasksPanel";
import { LeadDetailsPanel } from "./LeadDetailsPanel";

export const EnhancedLeadsManager = () => {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateData, setTemplateData] = useState<FormTemplateData | undefined>(undefined);
  const [selectedFormForPreview, setSelectedFormForPreview] = useState<any>(null);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list' | 'details'>('list'); // Changed default to 'list'
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState<any>(null);
  const [formBuilderTab, setFormBuilderTab] = useState("templates");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const { 
    leadForms, 
    leads, 
    loading, 
    createLeadForm, 
    updateLead, 
    exportLeads,
    refetchLeads 
  } = useLeadForms();
  
  const { clients, loading: clientsLoading } = useClientProfiles();
  const { tasks: allTasks } = useFollowUpTasks();

  const handleFormSave = async (formData: any) => {
    await createLeadForm(formData);
    setShowFormBuilder(false);
    setTemplateData(undefined);
    setFormBuilderTab("templates");
  };

  const handleUseTemplate = (template: any) => {
    setTemplateData({
      title: template.name,
      description: template.description,
      fields: template.fields
    });
    setFormBuilderTab("custom");
    setShowFormBuilder(true);
  };

  const handlePreviewTemplate = (template: any) => {
    const formForPreview = {
      id: `template-${template.id}`,
      title: template.name,
      description: template.description,
      fields: template.fields,
      branding: {
        primaryColor: '#8b5cf6'
      }
    };
    setSelectedTemplateForPreview(formForPreview);
  };

  const copyFormLink = (formId: string) => {
    const formUrl = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(formUrl);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.display_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.display_phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    hot: leads.filter(l => l.score === 'hot').length
  };

  const taskStats = {
    overdue: allTasks.filter(t => !t.is_completed && new Date(t.due_date) <= new Date()).length,
    today: allTasks.filter(t => !t.is_completed && 
      new Date(t.due_date).toDateString() === new Date().toDateString()).length,
    upcoming: allTasks.filter(t => !t.is_completed && new Date(t.due_date) > new Date()).length
  };

  if (showFormBuilder) {
    return (
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Create Lead Form</h2>
            <p className="text-sm md:text-base text-gray-600">Build a custom form to capture leads</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowFormBuilder(false);
              setTemplateData(undefined);
              setFormBuilderTab("templates");
            }}
            className="w-full sm:w-auto"
          >
            Back to Leads
          </Button>
        </div>
        
        <Tabs value={formBuilderTab} onValueChange={setFormBuilderTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates" className="text-xs sm:text-sm">Use Template</TabsTrigger>
            <TabsTrigger value="custom" className="text-xs sm:text-sm">Build Custom Form</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <LeadFormTemplates 
              onUseTemplate={handleUseTemplate} 
              onPreviewTemplate={handlePreviewTemplate}
            />
          </TabsContent>
          
          <TabsContent value="custom">
            <LeadFormBuilder onSave={handleFormSave} templateData={templateData} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Mobile-First Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Lead Management
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage your leads and convert them to clients</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={exportLeads} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-full sm:w-auto"
              onClick={() => {
                setShowFormBuilder(true);
                setFormBuilderTab("templates");
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Form</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-First Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-blue-100 truncate">Total Leads</p>
                <p className="text-lg md:text-2xl font-bold">{leadStats.total}</p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-green-100 truncate">New Leads</p>
                <p className="text-lg md:text-2xl font-bold">{leadStats.new}</p>
              </div>
              <Users className="w-6 h-6 md:w-8 md:h-8 text-green-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-red-100 truncate">Hot Leads</p>
                <p className="text-lg md:text-2xl font-bold">{leadStats.hot}</p>
              </div>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-red-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-purple-100 truncate">Converted</p>
                <p className="text-lg md:text-2xl font-bold">{leadStats.converted}</p>
              </div>
              <UserPlus className="w-6 h-6 md:w-8 md:h-8 text-purple-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-orange-100 truncate">Overdue</p>
                <p className="text-lg md:text-2xl font-bold">{taskStats.overdue}</p>
              </div>
              <CheckSquare className="w-6 h-6 md:w-8 md:h-8 text-orange-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-teal-100 truncate">Today</p>
                <p className="text-lg md:text-2xl font-bold">{taskStats.today}</p>
              </div>
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-teal-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Mobile-Optimized Tabs */}
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-5 min-w-fit">
            <TabsTrigger value="pipeline" className="text-xs md:text-sm px-2 md:px-4">Pipeline</TabsTrigger>
            <TabsTrigger value="leads" className="text-xs md:text-sm px-2 md:px-4">Leads</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs md:text-sm px-2 md:px-4">Tasks</TabsTrigger>
            <TabsTrigger value="clients" className="text-xs md:text-sm px-2 md:px-4">Clients</TabsTrigger>
            <TabsTrigger value="forms" className="text-xs md:text-sm px-2 md:px-4">Forms</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Mobile-First Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant={viewMode === 'pipeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('pipeline')}
                  className="w-full sm:w-auto"
                >
                  <Kanban className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Pipeline View</span>
                  <span className="sm:hidden">Pipeline</span>
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="w-full sm:w-auto"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">List View</span>
                  <span className="sm:hidden">List</span>
                </Button>
              </div>
              
              {/* Mobile Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input 
                  placeholder="Search leads..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {viewMode === 'pipeline' ? (
            <LeadPipeline />
          ) : selectedLeadForDetails ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="lg:col-span-2">
                <LeadDetailsPanel 
                  lead={selectedLeadForDetails} 
                  onUpdate={(updates) => updateLead(selectedLeadForDetails.id, updates)}
                />
              </div>
              <div>
                <FollowUpTasksPanel leadId={selectedLeadForDetails.id} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                      {/* Lead Header - Improved for medium screens */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0">
                            {lead.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'L'}
                          </div>
                          
                          {/* Lead Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base md:text-lg truncate">{lead.display_name || 'Unknown'}</h3>
                              <Badge className={getScoreColor(lead.score)}>
                                {lead.score}
                              </Badge>
                              <Badge variant="outline">{lead.status}</Badge>
                            </div>
                            
                            {/* Contact Details - Better spacing for medium screens */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{lead.display_email || 'No email'}</span>
                              </div>
                              {lead.display_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{lead.display_phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{new Date(lead.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{lead.form?.title || 'Unknown Form'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons - Better layout for medium screens */}
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 w-full lg:w-auto">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedLeadForDetails(lead)}
                            className="w-full sm:w-auto lg:w-full xl:w-auto"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedLead(lead)}
                            className="w-full sm:w-auto lg:w-full xl:w-auto"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Convert</span>
                            <span className="sm:hidden">Convert</span>
                          </Button>
                        </div>
                      </div>

                      {/* Message - Better styling */}
                      {lead.data.message && (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm border-l-4 border-purple-200">
                          <span className="font-medium text-gray-700">Message:</span> 
                          <p className="mt-1 text-gray-600 leading-relaxed">{lead.data.message}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          {/* Mobile-First Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input 
                    placeholder="Search leads..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Filter Buttons - Mobile Responsive */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={statusFilter === "all" ? "default" : "outline"}
                    onClick={() => setStatusFilter("all")}
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    All
                  </Button>
                  <Button 
                    variant={statusFilter === "new" ? "default" : "outline"}
                    onClick={() => setStatusFilter("new")}
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    New
                  </Button>
                  <Button 
                    variant={statusFilter === "qualified" ? "default" : "outline"}
                    onClick={() => setStatusFilter("qualified")}
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    Qualified
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={exportLeads}
                    size="sm"
                    className="w-full sm:w-auto sm:ml-auto"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads List - Mobile Optimized with improved medium screen layout */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">Loading leads...</div>
            ) : filteredLeads.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">
                    {searchTerm || statusFilter !== "all" ? "No leads match your filters" : "No leads yet"}
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredLeads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                      {/* Same improved layout as pipeline view */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0">
                            {lead.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'L'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base md:text-lg truncate">{lead.display_name || 'Unknown'}</h3>
                              <Badge className={getScoreColor(lead.score)}>
                                {lead.score}
                              </Badge>
                              <Badge variant="outline">{lead.status}</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{lead.display_email || 'No email'}</span>
                              </div>
                              {lead.display_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{lead.display_phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{new Date(lead.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{lead.form?.title || 'Unknown Form'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 w-full lg:w-auto">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedLead(lead)}
                            className="w-full sm:w-auto lg:w-full xl:w-auto"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Convert
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="w-full sm:w-auto lg:w-full xl:w-auto"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>

                      {lead.data.message && (
                        <div className="bg-gray-50 rounded-lg p-3 text-sm border-l-4 border-purple-200">
                          <span className="font-medium text-gray-700">Message:</span> 
                          <p className="mt-1 text-gray-600 leading-relaxed">{lead.data.message}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <FollowUpTasksPanel />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="space-y-3">
            {clientsLoading ? (
              <div className="text-center py-8">Loading clients...</div>
            ) : clients.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-500">No converted clients yet</div>
                </CardContent>
              </Card>
            ) : (
              clients.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {client.profile?.full_name?.split(' ').map(n => n[0]).join('') || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base md:text-lg mb-2">{client.profile?.full_name || 'Unknown Client'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div>Client since: {new Date(client.client_since).toLocaleDateString()}</div>
                          <div>Total appointments: {client.total_appointments}</div>
                          <div>Total spent: ${client.total_spent}</div>
                          {client.last_appointment_date && (
                            <div>Last visit: {new Date(client.last_appointment_date).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2 w-full lg:w-auto">
                        <Button size="sm" variant="outline" className="w-full sm:w-auto lg:w-full xl:w-auto">
                          <Calendar className="w-4 h-4 mr-1" />
                          Book
                        </Button>
                        <Button size="sm" variant="outline" className="w-full sm:w-auto lg:w-full xl:w-auto">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="forms">
          <div className="space-y-4">
            {leadForms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base md:text-lg">{form.title}</CardTitle>
                      {form.description && (
                        <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                      )}
                    </div>
                    <Badge variant={form.is_active ? "default" : "secondary"} className="self-start sm:self-center">
                      {form.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      {form.fields.length} fields • Created {new Date(form.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedFormForPreview(form)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyFormLink(form.id)}
                        className="w-full sm:w-auto"
                      >
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Lead Conversion Dialog */}
      <EnhancedLeadConversionDialog
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onConversionComplete={() => {
          refetchLeads();
          setSelectedLead(null);
        }}
      />

      {/* Form Preview Modal for created forms */}
      <FormPreviewModal
        isOpen={!!selectedFormForPreview}
        onClose={() => setSelectedFormForPreview(null)}
        form={selectedFormForPreview}
      />

      {/* Template Preview Modal */}
      <FormPreviewModal
        isOpen={!!selectedTemplateForPreview}
        onClose={() => setSelectedTemplateForPreview(null)}
        form={selectedTemplateForPreview}
      />
    </div>
  );
};
