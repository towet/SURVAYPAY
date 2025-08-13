/*
  # Create surveys and responses tables

  1. New Tables
    - `surveys`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `category` (text, not null)
      - `reward` (numeric, not null)
      - `duration` (integer, not null)
      - `created_at` (timestamp with time zone)
      - `status` (text, default 'active')
      - `required_tier` (text, default 'Basic')

    - `survey_responses`
      - `id` (uuid, primary key)
      - `survey_id` (uuid, references surveys)
      - `user_id` (uuid, references profiles)
      - `answers` (jsonb)
      - `completed_at` (timestamp with time zone)
      - `status` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Reading available surveys
      - Creating and reading own responses
*/

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  reward numeric NOT NULL,
  duration integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  required_tier text DEFAULT 'Basic'
);

-- Create survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys ON DELETE CASCADE,
  user_id uuid REFERENCES profiles ON DELETE CASCADE,
  answers jsonb,
  completed_at timestamptz DEFAULT now(),
  status text DEFAULT 'completed',
  UNIQUE(survey_id, user_id)
);

-- Enable RLS
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Policies for surveys
CREATE POLICY "Anyone can read active surveys"
  ON surveys
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Policies for survey responses
CREATE POLICY "Users can create their own responses"
  ON survey_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own responses"
  ON survey_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);