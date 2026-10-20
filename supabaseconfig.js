// Supabase Credentials
const SUPABASE_URL = 'https://dzytdijmabiebefhgkkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXRkaWptYWJpZWJlZmhna2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTE3MTAsImV4cCI6MjA4NTc2NzcxMH0.ni86vJbes2k0UmkpYp5gs-fqXF5uD9nzumAnfMpi9Hs';

// Supabase Client Initialize
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);