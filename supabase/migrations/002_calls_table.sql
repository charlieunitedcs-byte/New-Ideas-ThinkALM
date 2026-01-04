-- Week 2 Session 2: Calls Table Migration
-- This creates the calls table for storing call analysis history

-- Drop table if exists (for development)
DROP TABLE IF EXISTS calls CASCADE;

-- Calls table
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team TEXT NOT NULL,
  agent_name TEXT,
  prospect_name TEXT,
  transcript TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  summary TEXT,
  strengths JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  tone TEXT,
  emotional_intelligence INTEGER CHECK (emotional_intelligence >= 0 AND emotional_intelligence <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_team ON calls(team);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX idx_calls_score ON calls(score DESC);

-- Enable Row Level Security
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy 1: Users can view their own calls
CREATE POLICY "Users can view their own calls"
  ON calls
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own calls
CREATE POLICY "Users can insert their own calls"
  ON calls
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own calls
CREATE POLICY "Users can update their own calls"
  ON calls
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own calls
CREATE POLICY "Users can delete their own calls"
  ON calls
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 5: Service role can do anything (for backend operations)
CREATE POLICY "Service role full access"
  ON calls
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON calls TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE calls IS 'Stores call analysis history for all users';
COMMENT ON COLUMN calls.id IS 'Unique identifier for each call';
COMMENT ON COLUMN calls.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN calls.team IS 'Team name for filtering';
COMMENT ON COLUMN calls.agent_name IS 'Name of the sales agent';
COMMENT ON COLUMN calls.prospect_name IS 'Name of the prospect/client';
COMMENT ON COLUMN calls.transcript IS 'Full call transcript text';
COMMENT ON COLUMN calls.score IS 'AI-generated call quality score (0-100)';
COMMENT ON COLUMN calls.summary IS 'AI-generated call summary';
COMMENT ON COLUMN calls.strengths IS 'JSON array of call strengths';
COMMENT ON COLUMN calls.improvements IS 'JSON array of areas for improvement';
COMMENT ON COLUMN calls.tone IS 'Overall tone of the call';
COMMENT ON COLUMN calls.emotional_intelligence IS 'Emotional intelligence score (0-100)';
