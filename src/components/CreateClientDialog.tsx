
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: () => void;
}

export const CreateClientDialog = ({ isOpen, onClose, onClientCreated }: CreateClientDialogProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    notes: "",
    welcomeMessage: ""
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create client accounts",
        variant: "destructive"
      });
      return;
    }

    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-client-invitation', {
        body: {
          clientName: formData.full_name,
          clientEmail: formData.email,
          clientPhone: formData.phone || undefined,
          notes: formData.notes || undefined,
          welcomeMessage: formData.welcomeMessage || undefined
        }
      });

      if (error) throw error;

      if (data.success) {
        const successMessage = data.isExistingUser 
          ? `${formData.full_name} has been added to your client list`
          : `Account created for ${formData.full_name} and invitation email sent!`;
          
        toast({
          title: "Client Added Successfully",
          description: successMessage,
        });

        // Reset form and close dialog
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          notes: "",
          welcomeMessage: ""
        });
        onClose();
        onClientCreated();
      } else {
        throw new Error(data.error || 'Failed to create client account');
      }

    } catch (error: any) {
      console.error('Error creating client account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <p className="text-sm text-gray-600">
            Create a FlexiBug account for your client so they can book appointments and manage their schedule online.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter client's full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter client's email address"
              required
            />
            <p className="text-xs text-gray-500">
              This will be their username for logging into FlexiBug
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter client's phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Personal Welcome Message</Label>
            <Textarea
              id="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
              placeholder="Add a personal welcome message for the invitation email..."
              rows={3}
            />
            <p className="text-xs text-gray-500">
              This message will be included in the welcome email sent to your client
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any internal notes about this client..."
              rows={2}
            />
            <p className="text-xs text-gray-500">
              These notes are only visible to you
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• A FlexiBug account will be created for your client</li>
              <li>• They'll receive a welcome email with login credentials</li>
              <li>• They'll be prompted to change their password on first login</li>
              <li>• They can then book appointments and manage their schedule</li>
            </ul>
          </div>
          
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Client Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
