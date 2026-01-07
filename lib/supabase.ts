
import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string => {
  try {
    const value = (process.env as any)?.[key];
    if (typeof value === 'string' && value.length > 0) return value;
    return '';
  } catch {
    return '';
  }
};

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
