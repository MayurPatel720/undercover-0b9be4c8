// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://caltjrlnqfplisnatxnk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhbHRqcmxucWZwbGlzbmF0eG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2Nzc1NzEsImV4cCI6MjA1OTI1MzU3MX0.h1u5b_tU51xtdWhC-k7VRC6k7nntquXriDrFFIlfYSo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);