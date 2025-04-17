import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Music } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { User } from '@supabase/supabase-js';

interface SongRequestFormProps {
  onRequestSubmitted?: () => void;
}

export const SongRequestForm = ({ onRequestSubmitted }: SongRequestFormProps) => {
  const { user } = useAuth();
  const [songName, setSongName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to request a song');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting song request:', songName);
      
      // Insert song request using regular client
      const { error: insertError } = await supabase
        .from('song_requests')
        .insert({
          user_id: user.id,
          song_name: songName,
          status: 'pending'
        });

      if (insertError) {
        console.error('Error inserting song request:', insertError);
        throw insertError;
      }

      console.log('Song request submitted successfully');
      toast.success('Song request submitted!');
      setSongName('');
      onRequestSubmitted?.();
    } catch (error) {
      console.error('Error submitting song request:', error);
      toast.error('Failed to submit song request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Please log in to request songs</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="songName" className="block text-sm font-medium text-gray-700">
          Song Name
        </label>
        <input
          type="text"
          id="songName"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter song name"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Request Song'}
      </button>
    </form>
  );
};

export default SongRequestForm; 