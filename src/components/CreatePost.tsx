/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Image, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import AuthModal from './auth/AuthModal';

const CreatePost = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!content.trim() && !imageFile) {
      toast({ 
        title: "Error",
        description: "Please add some text or an image to your post",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // If there's an image, upload it first
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data } = supabase.storage
          .from('post-images')
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      // Insert the post into the database
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim() || null,
        image_url: imageUrl
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your post has been shared",
      });

      // Clear form
      setContent('');
      removeImage();
      if (onPostCreated) onPostCreated();

    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-card rounded-2xl shadow-md p-4 mb-4 w-full">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full p-0.5 gradient-primary">
              <div className="w-full h-full bg-white rounded-full overflow-hidden">
                <img 
                  src={user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}` : '/placeholder.svg'} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-800 dark:text-white">
                {user ? 'Share your thoughts...' : 'Sign in to post...'}
              </p>
            </div>
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full mb-3 min-h-[100px] resize-none"
          />
          
          {preview && (
            <div className="relative mb-3 rounded-xl overflow-hidden">
              <img 
                src={preview} 
                alt="Post preview" 
                className="max-h-64 w-full object-contain bg-gray-100"
              />
              <Button 
                type="button"
                variant="destructive" 
                size="icon"
                className="absolute top-2 right-2 rounded-full"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-1 sm:space-x-2">
              <Button 
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300 flex items-center p-1 sm:p-2"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Image className="h-5 w-5 sm:mr-1" />
                <span className="hidden sm:inline">Image</span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </Button>
              
              <Button 
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-300 flex items-center p-1 sm:p-2"
              >
                <Camera className="h-5 w-5 sm:mr-1" />
                <span className="hidden sm:inline">Photo</span>
              </Button>
            </div>
            
            <Button 
              type="submit"
              disabled={isSubmitting || (!content.trim() && !imageFile)}
              className="gradient-primary font-medium rounded-full px-3 sm:px-4"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </div>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default CreatePost;
