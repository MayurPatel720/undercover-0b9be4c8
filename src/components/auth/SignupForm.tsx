
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const { signUp, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignupValues) => {
    setSubmitting(true);
    try {
      await signUp(values.email, values.password, values.username);
      if (onSuccess) onSuccess();
    } finally {
      setSubmitting(false);
    }
  };
  
  const isLoading = loading || submitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="cooluser123" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your.email@example.com" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  className="bg-white/10 border-white/20 text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full gradient-primary" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
