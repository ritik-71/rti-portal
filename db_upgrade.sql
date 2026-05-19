-- RTI Portal: Production Database Schema & Security Overhaul

-- 1. Ensure core columns exist
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS user_id uuid references auth.users(id),
ADD COLUMN IF NOT EXISTS receipt_no text UNIQUE,
ADD COLUMN IF NOT EXISTS document_url text,
ADD COLUMN IF NOT EXISTS remarks text;

-- 2. Create Profiles Table (for Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  role text not null default 'user' check (role in ('user', 'officer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 4. Enforce Row Level Security (RLS) on all tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Drop old unsafe policies
DROP POLICY IF EXISTS "Allow public tracking" ON public.applications;
DROP POLICY IF EXISTS "Insert applications policy" ON public.applications;
DROP POLICY IF EXISTS "Update applications policy" ON public.applications;
DROP POLICY IF EXISTS "Delete applications policy" ON public.applications;
DROP POLICY IF EXISTS "Select applications policy" ON public.applications;

-- 6. Strict RLS Policies for Applications
-- SELECT: Users can see their own, officers/admins can see all.
-- Public tracking is handled via a secure backend route bypassing RLS (Service Role Key).
CREATE POLICY "Select applications policy" ON public.applications FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'officer'))
);

-- INSERT: Authenticated users can insert their own applications
CREATE POLICY "Insert applications policy" ON public.applications FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- UPDATE: Users can update their own apps, Officers/Admins can update any.
-- Note: Column-level protection (e.g. preventing users from approving their own apps) 
-- is enforced at the API Route level in Next.js.
CREATE POLICY "Update applications policy" ON public.applications FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'officer'))
);

-- DELETE: Only admins can delete applications
CREATE POLICY "Delete applications policy" ON public.applications FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. RLS Policies for Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Officers and Admins can view all profiles" ON public.profiles;
CREATE POLICY "Officers and Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'officer'))
);

-- 8. RLS Policies for Audit Logs
DROP POLICY IF EXISTS "View audit logs policy" ON public.audit_logs;
CREATE POLICY "View audit logs policy" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'officer'))
);

DROP POLICY IF EXISTS "Insert audit logs policy" ON public.audit_logs;
CREATE POLICY "Insert audit logs policy" ON public.audit_logs FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 9. Storage Bucket for File Uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('rti-files', 'rti-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'rti-files' );

DROP POLICY IF EXISTS "Auth Upload Access" ON storage.objects;
CREATE POLICY "Auth Upload Access" ON storage.objects FOR INSERT WITH CHECK ( 
  bucket_id = 'rti-files' AND auth.role() = 'authenticated' 
);

-- 10. Database Optimizations (Indexes for scalability)
CREATE INDEX IF NOT EXISTS idx_applications_receipt_no ON public.applications(receipt_no);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);
