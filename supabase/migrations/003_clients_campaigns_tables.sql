-- Week 2 Session 3: Clients and Campaigns Tables Migration
-- This creates the clients and campaigns tables for database storage

-- Drop tables if exists (for development)
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- ===========================
-- CLIENTS TABLE
-- ===========================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  plan TEXT NOT NULL DEFAULT 'Team Plan',
  status TEXT NOT NULL DEFAULT 'Trialing' CHECK (status IN ('Active', 'Trialing', 'Cancelled', 'Suspended')),
  subscription_id TEXT, -- Stripe subscription ID
  created_date TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  total_users INTEGER DEFAULT 1 CHECK (total_users >= 0),
  monthly_revenue NUMERIC(10, 2) DEFAULT 0 CHECK (monthly_revenue >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_plan ON clients(plan);
CREATE INDEX idx_clients_created_date ON clients(created_date DESC);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients

-- Policy 1: Users can view their own clients
CREATE POLICY "Users can view their own clients"
  ON clients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own clients
CREATE POLICY "Users can insert their own clients"
  ON clients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own clients
CREATE POLICY "Users can update their own clients"
  ON clients
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own clients
CREATE POLICY "Users can delete their own clients"
  ON clients
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 5: Service role full access
CREATE POLICY "Service role full access on clients"
  ON clients
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO authenticated;

-- Comments for documentation
COMMENT ON TABLE clients IS 'Stores client/customer information for sales teams';
COMMENT ON COLUMN clients.id IS 'Unique identifier for each client';
COMMENT ON COLUMN clients.user_id IS 'Foreign key to users table (sales rep/manager)';
COMMENT ON COLUMN clients.company_name IS 'Client company name';
COMMENT ON COLUMN clients.contact_name IS 'Primary contact person name';
COMMENT ON COLUMN clients.email IS 'Client email address';
COMMENT ON COLUMN clients.phone IS 'Client phone number';
COMMENT ON COLUMN clients.plan IS 'Subscription plan type';
COMMENT ON COLUMN clients.status IS 'Current subscription status';
COMMENT ON COLUMN clients.subscription_id IS 'Stripe subscription ID (if applicable)';
COMMENT ON COLUMN clients.total_users IS 'Number of users/seats';
COMMENT ON COLUMN clients.monthly_revenue IS 'Monthly recurring revenue from this client';

-- ===========================
-- CAMPAIGNS TABLE
-- ===========================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Completed')),
  start_date DATE,
  end_date DATE,
  total_calls INTEGER DEFAULT 0 CHECK (total_calls >= 0),
  avg_score NUMERIC(5, 2) DEFAULT 0 CHECK (avg_score >= 0 AND avg_score <= 100),
  revenue NUMERIC(12, 2) DEFAULT 0 CHECK (revenue >= 0),
  team_members JSONB DEFAULT '[]'::jsonb, -- Array of team member names
  description TEXT,
  goals JSONB, -- Campaign goals as JSON
  metrics JSONB, -- Campaign metrics as JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date DESC);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns

-- Policy 1: Users can view their own campaigns
CREATE POLICY "Users can view their own campaigns"
  ON campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own campaigns
CREATE POLICY "Users can insert their own campaigns"
  ON campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own campaigns
CREATE POLICY "Users can update their own campaigns"
  ON campaigns
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own campaigns
CREATE POLICY "Users can delete their own campaigns"
  ON campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 5: Service role full access
CREATE POLICY "Service role full access on campaigns"
  ON campaigns
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON campaigns TO authenticated;

-- Comments for documentation
COMMENT ON TABLE campaigns IS 'Stores sales campaign information';
COMMENT ON COLUMN campaigns.id IS 'Unique identifier for each campaign';
COMMENT ON COLUMN campaigns.user_id IS 'Foreign key to users table (campaign owner)';
COMMENT ON COLUMN campaigns.name IS 'Campaign name';
COMMENT ON COLUMN campaigns.status IS 'Current campaign status';
COMMENT ON COLUMN campaigns.start_date IS 'Campaign start date';
COMMENT ON COLUMN campaigns.end_date IS 'Campaign end date';
COMMENT ON COLUMN campaigns.total_calls IS 'Total number of calls in campaign';
COMMENT ON COLUMN campaigns.avg_score IS 'Average call quality score';
COMMENT ON COLUMN campaigns.revenue IS 'Total revenue generated';
COMMENT ON COLUMN campaigns.team_members IS 'JSON array of team member names';
