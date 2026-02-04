-- DANGER: This script will delete ALL data and tables in the public schema.
-- Run this in the Supabase SQL Editor to reset your database.

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- TABLE: PROFILES
-- Stores public user data like username, linking to auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING ( true );

CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE 
  USING ( auth.uid() = id );

-- CRITICAL: Grant access to the table for Supabase Auth roles
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- TRIGGER: Handle New User
-- This trigger automatically creates a profile entry when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  /* Existing handle_new_user triggers ... */
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =========================================
-- FEATURE: FARM MANAGEMENT
-- =========================================

-- TABLE: FARMS
-- Stores the user's main farm details (One farm per user for now)
CREATE TABLE public.farms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'My Farm',
  total_area NUMERIC(10, 2) DEFAULT 0, -- In Acres
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id) -- Enforce 1 farm per user for simplicity
);

-- RLS for Farms
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own farm" ON public.farms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own farm" ON public.farms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own farm" ON public.farms FOR UPDATE USING (auth.uid() = user_id);

GRANT ALL ON TABLE public.farms TO authenticated;
GRANT ALL ON TABLE public.farms TO service_role;


-- TABLE: FARM_CROPS
-- Stores individual crops planted on the farm
CREATE TABLE public.farm_crops (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE NOT NULL,
  crop_type TEXT NOT NULL,       -- e.g., 'Sugarcane', 'Cotton'
  area NUMERIC(10, 2) NOT NULL,  -- In Acres
  sowing_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Farm Crops
ALTER TABLE public.farm_crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view crops of own farm" 
  ON public.farm_crops FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = farm_crops.farm_id AND farms.user_id = auth.uid()));

CREATE POLICY "Users can insert crops to own farm" 
  ON public.farm_crops FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = farm_crops.farm_id AND farms.user_id = auth.uid()));

CREATE POLICY "Users can delete crops from own farm" 
  ON public.farm_crops FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.farms WHERE farms.id = farm_crops.farm_id AND farms.user_id = auth.uid()));

GRANT ALL ON TABLE public.farm_crops TO authenticated;
GRANT ALL ON TABLE public.farm_crops TO service_role;
