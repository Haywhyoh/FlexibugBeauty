
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLeadActivities } from "@/hooks/useLeadActivities";
import { useLeadConversion } from "@/hooks/useLeadConversion";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit3, 
  Send, 
  UserPlus,
  MessageSquare,
  Activity
} from "lucide-react";

interface LeadDetailsPanelProps {
  lead: any;
  onUpdate: (updates: any) => void;
}

export const LeadDetailsPanel = ({ lead, onUpdate }: LeadDetailsPanelProps) => {
  const { activities, addActivity } = useLeadActivities(lead.id);
  const { sendInvitation, loading: conversionLoading } = useLeadConversion();
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [newNote, setNewNote] = useState('');

  const handleSaveNotes = async () => {
    await onUpdate({ notes });
    setIsEditing(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    await addActivity({
      lead_id: lead.id,
      activity_type: 'note_added',
      activity_data: { note: newNote },
      notes: newNote
    });
    
    setNewNote('');
  };

  const handleSendInvitation = async () => {
    await sendInvitation(lead.id, lead.data);
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'qualified': return 'bg-green-100 text-green-800 border-green-200';
      case 'converted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'email_sent': return <Mail className="w-4 h-4" />;
      case 'call_made': return <Phone className="w-4 h-4" />;
      case 'meeting_scheduled': return <Calendar className="w-4 h-4" />;
      case 'note_added': return <MessageSquare className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Lead Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                {lead.display_name?.split(' ').map((n: string) => n[0]).join('') || 'L'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{lead.display_name || 'Unknown Lead'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getScoreColor(lead.score)}>
                    {lead.score} lead
                  </Badge>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleSendInvitation}
                disabled={conversionLoading}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Invite to App
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lead.display_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{lead.display_email}</span>
              </div>
            )}
            {lead.display_phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{lead.display_phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Submitted: {new Date(lead.created_at).toLocaleDateString()}</span>
            </div>
            {lead.form?.title && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Form: {lead.form.title}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lead Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(lead.data).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="text-gray-600">{String(value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notes</CardTitle>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead..."
                rows={4}
              />
              <Button onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </div>
          ) : (
            <p className="text-gray-600">
              {notes || 'No notes added yet.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add New Note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Activity Note</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about your interaction with this lead..."
              rows={3}
            />
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              <Send className="w-4 h-4 mr-1" />
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No activities yet</p>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm capitalize">
                        {activity.activity_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-gray-600">{activity.notes}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
