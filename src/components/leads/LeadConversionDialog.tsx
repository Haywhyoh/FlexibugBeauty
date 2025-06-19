
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, UserPlus } from "lucide-react";
import { useLeadConversion } from "@/hooks/useLeadConversion";

interface Lead {
  id: string;
  data: any;
  score: string;
  status: string;
  created_at: string;
  form?: {
    title: string;
  };
  // Add computed display fields
  display_name?: string;
  display_email?: string;
  display_phone?: string;
}

interface LeadConversionDialogProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onConversionComplete: () => void;
}

export const LeadConversionDialog = ({ 
  lead, 
  isOpen, 
  onClose, 
  onConversionComplete 
}: LeadConversionDialogProps) => {
  const [invitationSent, setInvitationSent] = useState(false);
  const { sendInvitation, loading } = useLeadConversion();

  if (!lead) return null;

  const handleSendInvitation = async () => {
    const token = await sendInvitation(lead.id, lead.data);
    if (token) {
      setInvitationSent(true);
      onConversionComplete();
    }
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Convert Lead to Client
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Lead Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{lead.display_name || 'Unknown'}</h3>
              <div className="flex gap-2">
                <Badge className={getScoreColor(lead.score)}>
                  {lead.score}
                </Badge>
                <Badge variant="outline">{lead.status}</Badge>
              </div>
            </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{lead.display_email || 'No email'}</span>
              </div>
              {lead.display_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{lead.display_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Submitted {new Date(lead.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span>{lead.form?.title || 'Unknown Form'}</span>
              </div>
            </div>

            {/* Additional Lead Data */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Form Submission Details:</h4>
              <div className="bg-white rounded p-3 text-sm space-y-2">
                {Object.entries(lead.data).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-gray-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conversion Options */}
          <div className="space-y-4">
            <h3 className="font-semibold">Conversion Options</h3>
            
            {!invitationSent ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Send Account Invitation</h4>
                <p className="text-sm text-purple-700 mb-4">
                  Send an email invitation to {lead.display_name} to create a client account. 
                  This will allow them to book appointments directly and manage their bookings.
                </p>
                <Button
                  onClick={handleSendInvitation}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  {loading ? 'Sending...' : 'Send Invitation Email'}
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">✓ Invitation Sent</h4>
                <p className="text-sm text-green-700">
                  An invitation email has been sent to {lead.display_email}. 
                  Once they create their account, they will automatically become your client.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
