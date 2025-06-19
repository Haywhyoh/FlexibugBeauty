
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string; // Keep for backward compatibility
  avatar_url?: string;
  business_name?: string;
  business_slug?: string;
  user_type?: string;
  facebook_handle?: string;
  tiktok_handle?: string;
  instagram_handle?: string;
  email?: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            first_name, 
            last_name, 
            full_name, 
            avatar_url, 
            business_name, 
            business_slug,
            user_type,
            facebook_handle,
            tiktok_handle,
            instagram_handle,
            email
          `)
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Helper function to get display name
  const getDisplayName = () => {
    if (loading) return "Loading...";
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) return profile.first_name;
    if (profile?.full_name) return profile.full_name;
    if (profile?.business_name) return profile.business_name;
    return user?.email?.split('@')[0] || "User";
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    if (profile?.first_name) {
      return profile.first_name.charAt(0).toUpperCase();
    }
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      return names.map(name => name.charAt(0)).join('').toUpperCase();
    }
    if (profile?.business_name) {
      return profile.business_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  // Helper function to get professional email
  const getProfessionalEmail = () => {
    return profile?.email || user?.email || '';
  };

  return { 
    profile, 
    loading, 
    getDisplayName, 
    getUserInitials,
    getProfessionalEmail
  };
};
