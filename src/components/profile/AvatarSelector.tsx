
import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Sparkles } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string | null;
  onAvatarChange: (url: string) => void;
  username: string;
}

type AvatarStyle = 'avataaars' | 'lorelei' | 'micah' | 'bottts' | 'pixel-art' | 'identicon';

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarChange,
  username
}) => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>('preset');
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>('avataaars');
  const [avatarSeed, setAvatarSeed] = useState<string>(username);
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  
  const avatarStyles: { value: AvatarStyle; label: string; description: string }[] = [
    { value: 'avataaars', label: 'Human', description: 'Cartoon human avatars' },
    { value: 'lorelei', label: 'Feminine', description: 'Feminine style avatars' },
    { value: 'micah', label: 'Masculine', description: 'Masculine style avatars' },
    { value: 'bottts', label: 'Robot', description: 'Robot style avatars' },
    { value: 'pixel-art', label: 'Pixel', description: 'Pixel art style avatars' },
    { value: 'identicon', label: 'Abstract', description: 'Abstract pattern avatars' }
  ];

  React.useEffect(() => {
    if (selectedTab === 'preset') {
      generateAvatarOptions();
    }
  }, [selectedStyle]);

  const generateAvatarOptions = () => {
    // Generate multiple avatar options with the selected style
    const options = [];
    for (let i = 0; i < 8; i++) {
      const seed = `${username}-${selectedStyle}-${i}`;
      options.push(`https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${seed}`);
    }
    setAvatarOptions(options);
  };

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value as AvatarStyle);
  };

  const refreshAvatarOptions = () => {
    generateAvatarOptions();
    toast({
      title: 'Avatars refreshed',
      description: 'New avatar options have been generated'
    });
  };

  const handleAvatarSelect = (url: string) => {
    onAvatarChange(url);
    toast({
      title: 'Avatar selected',
      description: 'Your new avatar has been selected',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file',
          variant: 'destructive'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }

      setUploadedFile(file);
    }
  };

  const uploadAvatar = async () => {
    if (!uploadedFile || !user) return;
    
    try {
      setUploading(true);
      
      // Create storage bucket if it doesn't exist (this would normally be done via SQL)
      
      // Upload the file
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${user.id}-${uuidv4()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, uploadedFile);
        
      if (uploadError) throw uploadError;
      
      // Get the URL
      const { data } = await supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      onAvatarChange(data.publicUrl);
      
      toast({
        title: 'Avatar uploaded',
        description: 'Your custom avatar has been uploaded'
      });
      
      onClose();
      
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="w-full max-w-lg bg-background rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Change Avatar</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
          
          <div className="p-5">
            <Tabs defaultValue="preset" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="preset">Preset Avatars</TabsTrigger>
                <TabsTrigger value="upload">Upload Custom</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preset" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Select Avatar Style</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshAvatarOptions}
                    className="flex items-center gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Refresh</span>
                  </Button>
                </div>
                
                <RadioGroup 
                  defaultValue={selectedStyle} 
                  onValueChange={handleStyleChange}
                  className="grid grid-cols-2 gap-3 md:grid-cols-3"
                >
                  {avatarStyles.map((style) => (
                    <div key={style.value} className="flex items-center space-x-2 border rounded-lg p-3">
                      <RadioGroupItem value={style.value} id={style.value} />
                      <div className="flex flex-col">
                        <Label htmlFor={style.value} className="font-medium">{style.label}</Label>
                        <span className="text-xs text-muted-foreground">{style.description}</span>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {avatarOptions.map((url, index) => (
                    <div 
                      key={index}
                      className={`rounded-lg p-2 cursor-pointer hover:bg-accent ${
                        currentAvatar === url ? 'bg-accent ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleAvatarSelect(url)}
                    >
                      <Avatar className="h-16 w-16 mx-auto">
                        <AvatarImage src={url} alt={`Avatar option ${index + 1}`} />
                        <AvatarFallback>
                          {username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <Upload className="mb-2 h-10 w-10 text-gray-400" />
                    <h3 className="text-lg font-medium">Upload a picture</h3>
                    <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium">
                        Choose File
                      </div>
                      <Input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </Label>
                    
                    {uploadedFile && (
                      <div className="flex flex-col items-center space-y-2">
                        <p className="text-sm">{uploadedFile.name}</p>
                        <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                          <img 
                            src={URL.createObjectURL(uploadedFile)} 
                            alt="Preview" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Button 
                          onClick={uploadAvatar} 
                          disabled={uploading}
                        >
                          {uploading ? 'Uploading...' : 'Use This Image'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="p-4 border-t flex justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AvatarSelector;
