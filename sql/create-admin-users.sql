-- Create admin_users table to store admin emails
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert your admin email (REPLACE WITH YOUR GOOGLE EMAIL)
INSERT INTO admin_users (email) VALUES
    ('caokhahieu9@gmail.com');  -- CHANGE THIS!

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read admin_users (for middleware check)
CREATE POLICY "Authenticated users can read admin_users" ON admin_users
    FOR SELECT USING (auth.role() = 'authenticated');
