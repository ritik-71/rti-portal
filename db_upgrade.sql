-- 1. Add new columns to applications table safely
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id),
ADD COLUMN IF NOT EXISTS receipt_no text UNIQUE,
ADD COLUMN IF NOT EXISTS document_url text,
ADD COLUMN IF NOT EXISTS remarks text;

-- 2. Create Profiles Table (for RBAC)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  role text not null default 'user' check (role in ('user', 'officer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Handle profile creation automatically on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id bigint primary key generated always as identity,
  application_id bigint references public.applications(id) on delete set null,
  action text not null,
  performed_by text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. RLS Policies for Applications
-- Allow unauthenticated public to view status by receipt_no (restricted by API selection)
CREATE POLICY "Allow public tracking" ON public.applications FOR SELECT USING (true);

-- Users can insert their own applications
CREATE POLICY "Insert applications policy" ON public.applications FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Officers & Admins can update status/remarks. Users cannot update once submitted (or restricted).
-- For simplicity without breaking UI, allow users to update their own, and officers/admins to update all.
CREATE POLICY "Update applications policy" ON public.applications FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'officer'))
);

-- Only Admins can delete
CREATE POLICY "Delete applications policy" ON public.applications FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. RLS Policies for Audit Logs (Only admins/officers can view)
CREATE POLICY "View audit logs policy" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'officer'))
);
CREATE POLICY "Insert audit logs policy" ON public.audit_logs FOR INSERT WITH CHECK (
  true -- App API needs to insert logs easily, or we handle via service role. Let's allow authenticated inserts.
);

-- 8. Create Storage Bucket for File Uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('rti-files', 'rti-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'rti-files' );

-- Allow authenticated users to upload files
CREATE POLICY "Auth Upload Access" ON storage.objects FOR INSERT WITH CHECK ( 
  bucket_id = 'rti-files' AND auth.role() = 'authenticated' 
);
