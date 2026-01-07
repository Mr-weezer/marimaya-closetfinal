
import { createClient } from '@supabase/supabase-js';

/**
 * Robustly extracts environment variables.
 * Handles cases where process.env might not be defined or values are non-string.
 */
const getEnvVar = (key: string): string => {
  try {
    const value = (process.env as any)?.[key];
    if (typeof value === 'string' && value.length > 0) return value;
    return '';
  } catch {
    return '';
  }
};

// Use the specific credentials provided for the Marimaya Closet project
const DEFAULT_URL = 'https://sujahraahtkvpknetczp.supabase.co';
const DEFAULT_KEY = 'sb_publishable_r131dnlHQ3QIpLNzTNeyGA_e1WYXIr3';

const supabaseUrl = 
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || 
  getEnvVar('SUPABASE_URL') || 
  DEFAULT_URL;

const supabaseAnonKey = 
  getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || 
  getEnvVar('SUPABASE_ANON_KEY') || 
  DEFAULT_KEY;

// Ensure we never pass an empty string to createClient to avoid the "supabaseKey is required" error
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Local storage or mock data may be required.');
}

export const supabase = createClient(
  supabaseUrl || DEFAULT_URL, 
  supabaseAnonKey || DEFAULT_KEY
);
