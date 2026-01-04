-- Week 2 Session 1: Users Table Migration
-- This creates the users table for authentication and user management

-- Drop table if exists (for development)
DROP TABLE IF EXISTS users CASCADE;

-- Users table
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

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team ON users(team);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy 1: Service role can do anything (for backend operations)
CREATE POLICY "Service role full access on users"
  ON users
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Policy 2: Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON users TO authenticated;

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user authentication and profile information';
COMMENT ON COLUMN users.id IS 'Unique identifier for each user (UUID)';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.name IS 'User full name';
COMMENT ON COLUMN users.role IS 'User role (SUPER_ADMIN, ADMIN, AGENT, CLIENT)';
COMMENT ON COLUMN users.team IS 'Team name for organization';
COMMENT ON COLUMN users.plan IS 'Subscription plan (INDIVIDUAL, TEAM, ENTERPRISE)';
COMMENT ON COLUMN users.status IS 'Account status (Active, Trialing, Cancelled)';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.last_login IS 'Last login timestamp';
COMMENT ON COLUMN users.avatar_url IS 'Profile avatar image URL';
