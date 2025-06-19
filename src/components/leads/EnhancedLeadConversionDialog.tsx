
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLeadConversion } from "@/hooks/useLeadConversion";
import { useFollowUpTasks } from "@/hooks/useFollowUpTasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mail, 
  UserPlus, 
  Calendar, 
  Phone, 
  MessageSquare,
  CheckCircle,
  Clock
} from "lucide-react";

interface EnhancedLeadConversionDialogProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
  onConversionComplete: () => void;
}

export const EnhancedLeadConversionDialog = ({ 
  lead, 
  isOpen, 
  onClose, 
  onConversionComplete 
}: EnhancedLeadConversionDialogProps) => {
  const { sendInvitation, loading } = useLeadConversion();
  const { createTask } = useFollowUpTasks();
  const [conversionStep, setConversionStep] = useState<'review' | 'invite' | 'schedule'>('review');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [followUpTask, setFollowUpTask] = useState({
    title: '',
    description: '',
    due_date: '',
    task_type: 'call' as const,
    priority: 'high' as const
  });

  if (!lead) return null;

  const handleSendInvitation = async () => {
    const result = await sendInvitation(lead.id, {
      ...lead.data,
      customMessage: invitationMessage
    });
    
    if (result) {
      setConversionStep('schedule');
    }
  };

  const handleScheduleFollowUp = async () => {
    if (followUpTask.title && followUpTask.due_date) {
      await createTask({
        ...followUpTask,
        lead_id: lead.id
      });
    }
    
    onConversionComplete();
    onClose();
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert Lead to Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {lead.display_name?.split(' ').map((n: string) => n[0]).join('') || 'L'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{lead.display_name || 'Unknown Lead'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getScoreColor(lead.score)}>
                      {lead.score} lead
                    </Badge>
                    <Badge variant="outline">{lead.status}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
                    {lead.display_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {lead.display_email}
                      </div>
                    )}
                    {lead.display_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {lead.display_phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Steps */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${conversionStep === 'review' ? 'text-purple-600' : conversionStep === 'invite' || conversionStep === 'schedule' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${conversionStep === 'review' ? 'bg-purple-100' : 'bg-green-100'}`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Review Lead</span>
            </div>
            
            <div className={`flex items-center gap-2 ${conversionStep === 'invite' ? 'text-purple-600' : conversionStep === 'schedule' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${conversionStep === 'invite' ? 'bg-purple-100' : conversionStep === 'schedule' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Send Invitation</span>
            </div>
            
            <div className={`flex items-center gap-2 ${conversionStep === 'schedule' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${conversionStep === 'schedule' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Schedule Follow-up</span>
            </div>
          </div>

          {/* Step Content */}
          {conversionStep === 'review' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lead Information Review</CardTitle>
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
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setConversionStep('invite')}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Proceed to Invitation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {conversionStep === 'invite' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Send Account Invitation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Personalized Message (Optional)
                    </label>
                    <Textarea
                      value={invitationMessage}
                      onChange={(e) => setInvitationMessage(e.target.value)}
                      placeholder="Add a personal message to the invitation email..."
                      rows={4}
                    />
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>What happens next:</strong>
                      <br />
                      • An invitation email will be sent to {lead.display_email}
                      <br />
                      • They'll receive a link to create their account
                      <br />
                      • Their information will be pre-filled for easy signup
                      <br />
                      • You'll be notified when they join
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setConversionStep('review')}>
                      Back
                    </Button>
                    <Button onClick={handleSendInvitation} disabled={loading}>
                      <Mail className="w-4 h-4 mr-2" />
                      {loading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {conversionStep === 'schedule' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Follow-up</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Invitation sent successfully to {lead.display_email}!
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Follow-up Task Title</label>
                    <Input
                      value={followUpTask.title}
                      onChange={(e) => setFollowUpTask({ ...followUpTask, title: e.target.value })}
                      placeholder="e.g., Follow up on account creation"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Task Type</label>
                    <Select 
                      value={followUpTask.task_type} 
                      onValueChange={(value: any) => setFollowUpTask({ ...followUpTask, task_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <Input
                      type="datetime-local"
                      value={followUpTask.due_date}
                      onChange={(e) => setFollowUpTask({ ...followUpTask, due_date: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={followUpTask.description}
                      onChange={(e) => setFollowUpTask({ ...followUpTask, description: e.target.value })}
                      placeholder="Additional details about the follow-up..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setConversionStep('invite')}>
                      Back
                    </Button>
                    <Button onClick={handleScheduleFollowUp}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Complete Conversion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
