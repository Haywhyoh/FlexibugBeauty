
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Clock, MessageSquare, Send } from 'lucide-react';

interface EmailSettings {
  confirmation_enabled: boolean;
  reminder_24h_enabled: boolean;
  reminder_2h_enabled: boolean;
  follow_up_enabled: boolean;
  custom_confirmation_message?: string;
  custom_reminder_message?: string;
  custom_follow_up_message?: string;
}

const EmailNotificationSettings = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    confirmation_enabled: true,
    reminder_24h_enabled: true,
    reminder_2h_enabled: true,
    follow_up_enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_notification_settings')
        .select('*')
        .eq('professional_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          confirmation_enabled: data.confirmation_enabled ?? true,
          reminder_24h_enabled: data.reminder_24h_enabled ?? true,
          reminder_2h_enabled: data.reminder_2h_enabled ?? true,
          follow_up_enabled: data.follow_up_enabled ?? true,
          custom_confirmation_message: data.custom_confirmation_message || '',
          custom_reminder_message: data.custom_reminder_message || '',
          custom_follow_up_message: data.custom_follow_up_message || '',
        });
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
      toast({
        title: "Error",
        description: "Failed to load email settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_notification_settings')
        .upsert({
          ...settings,
          professional_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your email notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-scheduled-emails');
      
      if (error) throw error;

      toast({
        title: "Test Email Process Started",
        description: "The scheduled email process has been triggered manually.",
      });
    } catch (error) {
      console.error('Error testing email system:', error);
      toast({
        title: "Error",
        description: "Failed to test email system",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading email settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Email Notification Settings
          </CardTitle>
          <CardDescription>
            Configure when and how your clients receive email notifications about their appointments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confirmation Emails */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Confirmation Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Send confirmation emails immediately when appointments are booked
                </p>
              </div>
              <Switch
                checked={settings.confirmation_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, confirmation_enabled: checked }))
                }
              />
            </div>
            {settings.confirmation_enabled && (
              <Textarea
                placeholder="Add a custom message for confirmation emails (optional)"
                value={settings.custom_confirmation_message || ''}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, custom_confirmation_message: e.target.value }))
                }
                className="mt-2"
              />
            )}
          </div>

          <Separator />

          {/* 24-Hour Reminders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">24-Hour Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send reminder emails 24 hours before appointments
                </p>
              </div>
              <Switch
                checked={settings.reminder_24h_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, reminder_24h_enabled: checked }))
                }
              />
            </div>
          </div>

          <Separator />

          {/* 2-Hour Reminders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">2-Hour Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send urgent reminder emails 2 hours before appointments
                </p>
              </div>
              <Switch
                checked={settings.reminder_2h_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, reminder_2h_enabled: checked }))
                }
              />
            </div>
            {settings.reminder_2h_enabled && (
              <Textarea
                placeholder="Add a custom message for reminder emails (optional)"
                value={settings.custom_reminder_message || ''}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, custom_reminder_message: e.target.value }))
                }
                className="mt-2"
              />
            )}
          </div>

          <Separator />

          {/* Follow-up Emails */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">Follow-up Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Send thank you and aftercare emails 24 hours after completed appointments
                </p>
              </div>
              <Switch
                checked={settings.follow_up_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, follow_up_enabled: checked }))
                }
              />
            </div>
            {settings.follow_up_enabled && (
              <Textarea
                placeholder="Add a custom aftercare message for follow-up emails (optional)"
                value={settings.custom_follow_up_message || ''}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, custom_follow_up_message: e.target.value }))
                }
                className="mt-2"
              />
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={testEmail}>
              <Send className="w-4 h-4 mr-2" />
              Test Email System
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Email Automation Status
          </CardTitle>
          <CardDescription>
            The email system runs automatically every 30 minutes to send scheduled notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium text-green-800">Confirmations</h3>
              <p className="text-sm text-green-600">Sent immediately</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <h3 className="font-medium text-yellow-800">Reminders</h3>
              <p className="text-sm text-yellow-600">24h & 2h before</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Send className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium text-blue-800">Follow-ups</h3>
              <p className="text-sm text-blue-600">24h after completion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailNotificationSettings;
