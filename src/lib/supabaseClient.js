import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mmqvkfgiyxmcapucwqmd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tcXZrZmdpeXhtY2FwdWN3cW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDk3MzksImV4cCI6MjA2MzMyNTczOX0.xHFTRJb1JmBRaMKjL2Zwgmmvtb_St1x3s-K5j5y5Smg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);