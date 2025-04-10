import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Music } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SongRequestFormProps {
  onSuccess?: () => void;
}

const SongRequestForm: React.FC<SongRequestFormProps> = ({ onSuccess }) => {
  const [songName, setSongName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const ensureUserProfileExists = async (userId: string) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, name, avatar, tags')
        .eq('id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      // If profile doesn't exist, create one
      if (!existingProfile && user) {
        console.log('Creating profile for user:', user.id);
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: user.name,
            avatar: user.avatar,
            tags: user.tags || []
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          throw insertError;
        }

        // Verify profile was created
        const { data: verifyProfile, error: verifyError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (verifyError || !verifyProfile) {
          throw new Error('Failed to verify profile creation');
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile exists:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songName.trim() || !user) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting song request for user:', user.id);
      
      // Ensure user profile exists before submitting request
      await ensureUserProfileExists(user.id);
      
      const { error } = await supabase
        .from('demo_song_requests')
        .insert([
          {
            user_id: user.id,
            song_name: songName.trim(),
            status: 'pending'
          }
        ]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: 'בקשה נשלחה!',
        description: 'הבקשה לשיר נשלחה בהצלחה וממתינה לאישור.',
      });

      setSongName('');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting song request:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'אירעה שגיאה בשליחת הבקשה. אנא נסה שוב.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center text-muted-foreground">
        אנא התחבר כדי לבקש שיר
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        type="text"
        value={songName}
        onChange={(e) => setSongName(e.target.value)}
        placeholder="שם השיר..."
        className="flex-1"
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        disabled={isSubmitting || !songName.trim()}
        className="flex items-center gap-2"
      >
        <Music className="h-4 w-4" />
        בקש שיר
      </Button>
    </form>
  );
};

export default SongRequestForm; 