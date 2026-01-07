-- =====================================================
-- Week 3 Session 1: Campaigns Table Migration
-- =====================================================
-- This completes the campaigns migration that was
-- partially done in Week 2 Session 3
-- =====================================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS campaigns CASCADE;

-- Create campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  start_date DATE NOT NULL,
  end_date DATE,
  total_calls INTEGER DEFAULT 0,
  avg_score NUMERIC(5, 2) DEFAULT 0,
  revenue NUMERIC(10, 2) DEFAULT 0,
  team_members JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  goals JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date DESC);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Users can insert their own campaigns
CREATE POLICY "Users can insert own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at();

-- Grant permissions
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaigns TO service_role;

-- Add comments for documentation
COMMENT ON TABLE campaigns IS 'Sales campaigns with performance tracking';
COMMENT ON COLUMN campaigns.user_id IS 'Campaign owner (references users table)';
COMMENT ON COLUMN campaigns.team_members IS 'Array of user IDs assigned to campaign';
COMMENT ON COLUMN campaigns.goals IS 'Campaign goals and KPIs as JSON';
