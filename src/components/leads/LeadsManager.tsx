
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Download, 
  Search, 
  Filter,
  Code,
  Eye,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  Mail,
  Phone
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadFormBuilder } from './LeadFormBuilder';
import { useLeadForms } from '@/hooks/useLeadForms';

export const LeadsManager = () => {
  const {
    leadForms,
    leads,
    loading,
    createLeadForm,
    updateLead,
    exportLeads
  } = useLeadForms();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const filteredLeads = leads.filter(lead => {
    const searchString = `${lead.display_name} ${lead.display_email} ${lead.display_phone}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesScore = scoreFilter === 'all' || lead.score === scoreFilter;
    return matchesSearch && matchesStatus && matchesScore;
  });

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'hot': return 'bg-red-100 text-red-700 border-red-200';
      case 'warm': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cold': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'contacted': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'qualified': return 'bg-green-100 text-green-700 border-green-200';
      case 'converted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'lost': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSaveForm = async (formData: any) => {
    await createLeadForm(formData);
    setShowFormBuilder(false);
  };

  const handleUpdateLead = async (updates: any) => {
    if (selectedLead) {
      await updateLead(selectedLead.id, updates);
      setSelectedLead(null);
    }
  };

  const leadStats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    hot: leads.filter(l => l.score === 'hot').length,
    converted: leads.filter(l => l.status === 'converted').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-gray-600">Manage your lead forms and submissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportLeads} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowFormBuilder(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{leadStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Leads</p>
                <p className="text-2xl font-bold">{leadStats.new}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold">{leadStats.hot}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold">{leadStats.converted}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Forms ({leadForms.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {leadForms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No lead forms created yet</p>
              <Button onClick={() => setShowFormBuilder(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Form
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {leadForms.map((form) => (
                <div key={form.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{form.title}</h3>
                      <p className="text-sm text-gray-600">{form.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={form.is_active ? "default" : "secondary"}>
                          {form.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {leads.filter(l => l.form_id === form.id).length} submissions
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Code className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads ({filteredLeads.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No leads found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div key={lead.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {lead.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'L'}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{lead.display_name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge className={getScoreColor(lead.score)}>
                              {lead.score}
                            </Badge>
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(lead.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {lead.display_email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {lead.display_email}
                          </div>
                        )}
                        {lead.display_phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {lead.display_phone}
                          </div>
                        )}
                      </div>

                      {/* Additional form data */}
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Additional Details:</strong>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                          {Object.entries(lead.data)
                            .filter(([key, value]) => 
                              !['name', 'full_name', 'firstName', 'lastName', 'email', 'phone'].includes(key) && 
                              value && String(value).trim() !== ''
                            )
                            .map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:</span>{' '}
                                <span>{String(value)}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {lead.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {lead.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Builder Dialog */}
      <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Lead Form</DialogTitle>
          </DialogHeader>
          <LeadFormBuilder onSave={handleSaveForm} />
        </DialogContent>
      </Dialog>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <Select
                  value={selectedLead.score}
                  onValueChange={(value) => setSelectedLead({...selectedLead, score: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={selectedLead.status}
                  onValueChange={(value) => setSelectedLead({...selectedLead, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  value={selectedLead.notes || ''}
                  onChange={(e) => setSelectedLead({...selectedLead, notes: e.target.value})}
                  placeholder="Add notes about this lead..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedLead(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateLead({
                  score: selectedLead.score,
                  status: selectedLead.status,
                  notes: selectedLead.notes
                })}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
