
-- Drop old triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;

-- Drop old functions with CASCADE
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- Drop old tables
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Drop old enum
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create new users table (username-based, no auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'organizer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create new events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  price NUMERIC DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 50,
  available_slots INTEGER NOT NULL DEFAULT 50,
  image_url TEXT,
  category TEXT DEFAULT 'general',
  location TEXT,
  organizer_username TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_username TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  booking_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, participant_username)
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies: public access (username-based auth, no Supabase Auth)
CREATE POLICY "Anyone can read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can create users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can create events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete events" ON public.events FOR DELETE USING (true);

CREATE POLICY "Anyone can read tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Anyone can create tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete tickets" ON public.tickets FOR DELETE USING (true);

-- Update trigger for events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
