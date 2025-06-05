import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axnjqcbwjrfqexpvnsjh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4bmpxY2J3anJmcWV4cHZuc2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNTMxNjEsImV4cCI6MjA2NDcyOTE2MX0.wrMFGBk8PQ9Ta41DlZBSbOzGyS9zRG7w26BDo8j0EDM';              // dein anon-public Key

export const supabase = createClient(supabaseUrl, supabaseKey);
