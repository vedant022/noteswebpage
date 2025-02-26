
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://egptzslyizdpcapnvpjk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncHR6c2x5aXpkcGNhcG52cGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NjI2OTMsImV4cCI6MjA1NjEzODY5M30.BBfFM7hjDJ5m-PK5U5w0XY9ab-VNky0HJjhQIkzfCrI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
