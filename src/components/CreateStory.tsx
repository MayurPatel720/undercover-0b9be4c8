
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { generateRandomUsername, getAvatarUrl } from '@/utils/nameUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CreateStory = ({ onStoryCreated }: { onStoryCreated?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a story",
        variant: "destructive",
      });
      return;
    }

    if (!selectedImage) {
      toast({
        title: "Image required",
        description: "Please select an image for your story",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // 1. Upload image to Supabase Storage
      const fileExt = selectedImage.name.split('.').pop();
      const filePath = `stories/${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('media')
        .upload(filePath, selectedImage);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: urlData } = await supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) throw new Error('Failed to get public URL');

      // 3. Create story in database
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          image_url: urlData.publicUrl,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Story created",
        description: "Your story has been shared successfully!",
      });

      setIsOpen(false);
      setSelectedImage(null);
      setImagePreview(null);
      
      if (onStoryCreated) {
        onStoryCreated();
      }
    } catch (error: any) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create story",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <>
      <div 
        className="flex flex-col items-center space-y-1 mx-2 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center border-2 border-dashed border-primary">
            <Plus className="w-6 h-6 text-primary" />
          </div>
        </div>
        <span className="text-xs truncate w-16 text-center">Your Story</span>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Story</DialogTitle>
            <DialogDescription>
              Add a photo to share with everyone. Stories disappear after 24 hours.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!imagePreview ? (
              <div className="flex flex-col items-center">
                <label 
                  htmlFor="story-image" 
                  className="w-full h-80 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors"
                >
                  <Camera size={48} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to select an image</p>
                  <input
                    id="story-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Story preview" 
                  className="w-full h-80 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={clearSelectedImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateStory} 
                disabled={!selectedImage || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Create Story'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateStory;
