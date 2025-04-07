
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Initialize the Supabase client with the values from the auto-generated client
const supabaseUrl = "https://caltjrlnqfplisnatxnk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbHRqcmxucWZwbGlzbmF0eG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc1NzEsImV4cCI6MjA1OTI1MzU3MX0.h1u5b_tU51xtdWhC-k7VRC6k7nntquXriDrFFIlfYSo";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
