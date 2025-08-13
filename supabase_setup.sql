-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  account_type TEXT DEFAULT 'basic' CHECK (account_type IN ('basic', 'premium')),
  is_account_activated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create earnings table
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT NOT NULL,
  payout_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create completed_surveys table
CREATE TABLE IF NOT EXISTS completed_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  survey_id TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT false,
  reward_amount DECIMAL(10, 2) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create secure RLS policies
-- Profiles policy: Users can only view and update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Earnings policy: Users can only view their own earnings
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own earnings" 
  ON earnings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own earnings records" 
  ON earnings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Withdrawals policy: Users can only view and create their own withdrawals
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own withdrawals" 
  ON withdrawals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawal requests" 
  ON withdrawals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Completed surveys policy: Users can only view their own completed surveys
ALTER TABLE completed_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completed surveys" 
  ON completed_surveys FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own completed surveys" 
  ON completed_surveys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to create a new profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile after signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
