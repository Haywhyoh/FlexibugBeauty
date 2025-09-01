
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save, User, MapPin, Phone, Globe, Instagram, ExternalLink, Facebook, Mail } from "lucide-react";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  user_type: string | null;
  phone: string | null;
  business_name: string | null;
  business_slug: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location: string | null;
  instagram_handle: string | null;
  facebook_handle: string | null;
  tiktok_handle: string | null;
  website_url: string | null;
  years_experience: number | null;
  is_profile_public: boolean | null;
  email: string | null;
}

export const ProfileEditor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    id: user?.id || '',
    first_name: '',
    last_name: '',
    full_name: '',
    user_type: 'beauty_professional',
    phone: '',
    business_name: '',
    business_slug: '',
    bio: '',
    avatar_url: '',
    cover_url: '',
    location: '',
    instagram_handle: '',
    facebook_handle: '',
    tiktok_handle: '',
    website_url: '',
    years_experience: null,
    is_profile_public: true,
    email: '',
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      // Auto-save to database immediately
      const { error: saveError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (saveError) {
        console.error('Error saving avatar URL to database:', saveError);
        throw saveError;
      }

      console.log('Avatar auto-saved to database');
      
      toast({
        title: "Success",
        description: "Avatar uploaded and saved successfully!",
      });
    } catch (error) {
      console.error('Error uploading/saving avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingCover(true);
      
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/cover.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update local state
      setProfile(prev => ({ ...prev, cover_url: publicUrl }));
      
      console.log('Cover image uploaded, URL set to:', publicUrl);
      
      // Auto-save to database immediately
      const { error: saveError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          cover_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (saveError) {
        console.error('Error saving cover URL to database:', saveError);
        throw saveError;
      }

      console.log('Cover image auto-saved to database');
      
      toast({
        title: "Success",
        description: "Cover image uploaded and saved successfully!",
      });
    } catch (error) {
      console.error('Error uploading/saving cover:', error);
      toast({
        title: "Error",
        description: "Failed to upload cover image",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isProfessional = profile.user_type === 'beauty_professional';
  const displayName = profile.first_name && profile.last_name 
    ? `${profile.first_name} ${profile.last_name}`
    : profile.first_name || profile.full_name || user?.email?.split('@')[0] || 'User';

  const publicProfileUrl = profile.business_slug 
    ? `/profile/${profile.business_slug}` 
    : `/profile/${user?.id}`;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your personal information and preferences</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(publicProfileUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Profile
          </Button>
          <Badge variant={isProfessional ? "default" : "secondary"}>
            {isProfessional ? "Beauty Professional" : "Client"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Avatar Section */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-4 h-4 lg:w-5 lg:h-5" />
              Profile Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
            <Avatar className="w-20 h-20 lg:w-24 lg:h-24 self-center sm:self-auto">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xl lg:text-2xl">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <label htmlFor="avatar">
                <Button type="button" variant="outline" disabled={uploadingAvatar} asChild>
                  <span className="cursor-pointer">
                    <Camera className="w-4 h-4 mr-2" />
                    {uploadingAvatar ? "Uploading..." : "Change Photo"}
                  </span>
                </Button>
              </label>
              <p className="text-xs lg:text-sm text-gray-500 mt-2">
                Upload a professional photo to help clients recognize you
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image Section */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-4 h-4 lg:w-5 lg:h-5" />
              Cover Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cover Image Preview */}
            <div className="relative w-full h-32 sm:h-40 lg:h-48 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg overflow-hidden">
              {profile.cover_url ? (
                <img 
                  src={profile.cover_url} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No cover image uploaded</p>
                  </div>
                </div>
              )}
              
              {/* Upload Button Overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <input
                  type="file"
                  id="cover"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <label htmlFor="cover">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    disabled={uploadingCover} 
                    className="opacity-0 hover:opacity-100 transition-opacity duration-300"
                    asChild
                  >
                    <span className="cursor-pointer">
                      <Camera className="w-4 h-4 mr-2" />
                      {uploadingCover ? "Uploading..." : "Change Cover"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <input
                  type="file"
                  id="cover-button"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <label htmlFor="cover-button">
                  <Button type="button" variant="outline" disabled={uploadingCover} asChild>
                    <span className="cursor-pointer">
                      <Camera className="w-4 h-4 mr-2" />
                      {uploadingCover ? "Uploading..." : "Upload Cover Image"}
                    </span>
                  </Button>
                </label>
              </div>
              {profile.cover_url && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setProfile(prev => ({ ...prev, cover_url: '' }))}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove Cover
                </Button>
              )}
            </div>
            
            <p className="text-xs lg:text-sm text-gray-500">
              Upload a cover image to make your profile stand out. Recommended size: 1200x400 pixels
            </p>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <Input
                  value={profile.first_name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Enter your first name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <Input
                  value={profile.last_name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <Input
                    value={profile.email || user?.email || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    type="email"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used for appointment notifications
                  </p>
                </div>
              </div>
              
              {isProfessional && (
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-2">Business Name</label>
                  <Input
                    value={profile.business_name || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, business_name: e.target.value }))}
                    placeholder="Your business or studio name"
                  />
                  {profile.business_slug && (
                    <p className="text-xs text-gray-500 mt-1">
                      Public URL: /profile/{profile.business_slug}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <Input
                    value={profile.phone || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    type="tel"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={profile.location || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <Textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder={isProfessional ? "Tell clients about your experience and specialties..." : "Tell us a bit about yourself..."}
                rows={4}
                className="text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        {isProfessional && (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Years of Experience</label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={profile.years_experience || ''}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      years_experience: e.target.value ? parseInt(e.target.value) : null 
                    }))}
                    placeholder="5"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Website</label>
                    <Input
                      value={profile.website_url || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                      type="url"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Social Media */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Instagram Handle</label>
                  <Input
                    value={profile.instagram_handle || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, instagram_handle: e.target.value }))}
                    placeholder="@yourusername"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Facebook Handle</label>
                  <Input
                    value={profile.facebook_handle || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, facebook_handle: e.target.value }))}
                    placeholder="@yourusername"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3.5 8c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm7 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z"/>
                </svg>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">TikTok Handle</label>
                  <Input
                    value={profile.tiktok_handle || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, tiktok_handle: e.target.value }))}
                    placeholder="@yourusername"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
};
