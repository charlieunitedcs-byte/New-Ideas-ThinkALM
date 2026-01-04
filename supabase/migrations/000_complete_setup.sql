-- Complete Database Setup - All Tables
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- 1. USERS TABLE
-- ============================================

DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS calls CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  team TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'INDIVIDUAL',
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  avatar_url TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team ON users(team);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on users"
  ON users FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

GRANT SELECT, UPDATE ON users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- 2. CALLS TABLE
-- ============================================

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

CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_team ON calls(team);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX idx_calls_score ON calls(score DESC);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calls"
  ON calls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calls"
  ON calls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calls"
  ON calls FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calls"
  ON calls FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on calls"
  ON calls FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

GRANT SELECT, INSERT, UPDATE, DELETE ON calls TO authenticated;

-- ============================================
-- 3. CLIENTS TABLE
-- ============================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  plan TEXT NOT NULL DEFAULT 'Team Plan',
  status TEXT NOT NULL DEFAULT 'Trialing' CHECK (status IN ('Active', 'Trialing', 'Cancelled', 'Suspended')),
  subscription_id TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  total_users INTEGER DEFAULT 1 CHECK (total_users >= 0),
  monthly_revenue NUMERIC(10, 2) DEFAULT 0 CHECK (monthly_revenue >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_plan ON clients(plan);
CREATE INDEX idx_clients_created_date ON clients(created_date DESC);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on clients"
  ON clients FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO authenticated;

-- ============================================
-- 4. CAMPAIGNS TABLE
-- ============================================

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
  team_members JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  goals JSONB,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date DESC);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on campaigns"
  ON campaigns FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

GRANT SELECT, INSERT, UPDATE, DELETE ON campaigns TO authenticated;

-- ============================================
-- 5. SHARED FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calls_updated_at
  BEFORE UPDATE ON calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Verify with: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- ============================================
