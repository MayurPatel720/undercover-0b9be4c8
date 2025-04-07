
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { getAvatarUrl } from '@/utils/nameUtils';
import { UserProfile } from '@/lib/database.types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AvatarSelector from './AvatarSelector';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
}

interface FormValues {
  username: string;
  gender: 'male' | 'female' | 'other';
  birthDate: Date | null;
  mobileNumber: string;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  isOpen,
  onClose,
  userProfile
}) => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile?.avatar_url || null);
  
  const form = useForm<FormValues>({
    defaultValues: {
      username: userProfile?.username || '',
      gender: userProfile?.gender || 'other',
      birthDate: userProfile?.birth_date ? new Date(userProfile.birth_date) : null,
      mobileNumber: userProfile?.mobile_number || '',
    },
  });

  useEffect(() => {
    // Update form values when userProfile changes
    if (userProfile) {
      form.reset({
        username: userProfile.username || '',
        gender: userProfile?.gender || 'other',
        birthDate: userProfile.birth_date ? new Date(userProfile.birth_date) : null,
        mobileNumber: userProfile?.mobile_number || '',
      });
      setAvatarUrl(userProfile.avatar_url);
    }
  }, [userProfile, form]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Use the selected avatar URL or generate new one based on gender
      let finalAvatarUrl = avatarUrl;
      
      if (!finalAvatarUrl || (!avatarUrl?.includes('api.dicebear.com') && !avatarUrl?.includes('supabase'))) {
        finalAvatarUrl = getAvatarUrl(data.username, data.gender);
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          gender: data.gender,
          birth_date: data.birthDate ? data.birthDate.toISOString().split('T')[0] : null,
          mobile_number: data.mobileNumber,
          avatar_url: finalAvatarUrl
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  const openAvatarSelector = () => {
    setShowAvatarSelector(true);
  };

  const closeAvatarSelector = () => {
    setShowAvatarSelector(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information and preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={avatarUrl || getAvatarUrl(userProfile?.username || '', userProfile?.gender)}
                  alt={userProfile?.username || 'User'}
                />
                <AvatarFallback>
                  {userProfile?.username?.substring(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon"
                variant="secondary" 
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={openAvatarSelector}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your username" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Gender Selection */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Avatar Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      This helps determine your avatar appearance if you don't choose a custom one.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Birth Date Field */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Your date of birth is used to calculate your age.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Mobile Number Field */}
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your mobile number" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your mobile number will not be shared publicly.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {showAvatarSelector && (
        <AvatarSelector
          isOpen={showAvatarSelector}
          onClose={closeAvatarSelector}
          currentAvatar={avatarUrl || ''}
          onAvatarChange={handleAvatarChange}
          username={userProfile?.username || form.getValues().username}
        />
      )}
    </>
  );
};

export default ProfileSettings;
