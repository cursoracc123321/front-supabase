import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://192.168.8.12:54321';
const supabaseAnonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
