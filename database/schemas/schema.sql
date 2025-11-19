-- PostgreSQL Database Schema for Polling System
-- Version: 1.0
-- Description: Complete database schema for a polling application with user management,
--              poll creation, voting, reporting, and admin logging functionality.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable timestamp functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- User role enumeration
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- Poll status enumeration
CREATE TYPE poll_status AS ENUM ('draft', 'active', 'closed', 'archived');

-- Report status enumeration
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- Report type enumeration
CREATE TYPE report_type AS ENUM ('poll', 'comment', 'user', 'other');

-- Admin action type enumeration
CREATE TYPE admin_action_type AS ENUM (
    'user_created', 'user_updated', 'user_deleted', 'user_banned', 'user_unbanned',
    'poll_created', 'poll_updated', 'poll_deleted', 'poll_closed',
    'report_reviewed', 'report_resolved', 'report_dismissed',
    'content_moderated', 'settings_changed', 'other'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Users Table
-- Stores user authentication and profile information
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role user_role DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    profile_image_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    banned_at TIMESTAMP WITH TIME ZONE,
    banned_reason TEXT,
    
    -- Constraints
    CONSTRAINT username_min_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = true;

-- ----------------------------------------------------------------------------
-- Polls Table
-- Stores poll metadata including title, description, and settings
-- ----------------------------------------------------------------------------
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status poll_status DEFAULT 'draft' NOT NULL,
    is_public BOOLEAN DEFAULT true NOT NULL,
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    allow_multiple_votes BOOLEAN DEFAULT false NOT NULL,
    max_votes_per_user INTEGER DEFAULT 1,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0 NOT NULL,
    
    -- Constraints
    CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT valid_date_range CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at),
    CONSTRAINT max_votes_positive CHECK (max_votes_per_user > 0)
);

-- Indexes for polls table
CREATE INDEX idx_polls_creator_id ON polls(creator_id);
CREATE INDEX idx_polls_status ON polls(status);
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX idx_polls_ends_at ON polls(ends_at) WHERE ends_at IS NOT NULL;
CREATE INDEX idx_polls_is_public ON polls(is_public) WHERE is_public = true;

-- ----------------------------------------------------------------------------
-- Poll Options Table
-- Stores individual options/choices for each poll
-- ----------------------------------------------------------------------------
CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(500) NOT NULL,
    option_order INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    vote_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT option_text_not_empty CHECK (char_length(trim(option_text)) > 0),
    CONSTRAINT vote_count_non_negative CHECK (vote_count >= 0),
    CONSTRAINT unique_option_order_per_poll UNIQUE(poll_id, option_order)
);

-- Indexes for poll_options table
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_poll_options_order ON poll_options(poll_id, option_order);
CREATE INDEX idx_poll_options_vote_count ON poll_options(vote_count DESC);

-- ----------------------------------------------------------------------------
-- Votes Table
-- Records user votes on poll options
-- ----------------------------------------------------------------------------
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    poll_option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    -- Prevent duplicate votes from same user on same poll option
    CONSTRAINT unique_user_vote_per_option UNIQUE(user_id, poll_option_id)
);

-- Indexes for votes table
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_poll_option_id ON votes(poll_option_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_voted_at ON votes(voted_at DESC);
CREATE INDEX idx_votes_ip_address ON votes(ip_address);

-- ----------------------------------------------------------------------------
-- Reports Table
-- Stores user-submitted reports for inappropriate content or behavior
-- ----------------------------------------------------------------------------
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    report_type report_type NOT NULL,
    status report_status DEFAULT 'pending' NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    reviewed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT reason_not_empty CHECK (char_length(trim(reason)) > 0),
    CONSTRAINT at_least_one_target CHECK (
        reported_user_id IS NOT NULL OR 
        reported_poll_id IS NOT NULL
    )
);

-- Indexes for reports table
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_reported_poll_id ON reports(reported_poll_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_reviewed_by_id ON reports(reviewed_by_id);

-- ----------------------------------------------------------------------------
-- Admin Logs Table
-- Audit trail for administrative actions performed in the system
-- ----------------------------------------------------------------------------
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action_type admin_action_type NOT NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_poll_id UUID REFERENCES polls(id) ON DELETE SET NULL,
    target_report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
    action_description TEXT NOT NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT action_description_not_empty CHECK (char_length(trim(action_description)) > 0)
);

-- Indexes for admin_logs table
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action_type ON admin_logs(action_type);
CREATE INDEX idx_admin_logs_target_user_id ON admin_logs(target_user_id);
CREATE INDEX idx_admin_logs_target_poll_id ON admin_logs(target_poll_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_metadata ON admin_logs USING gin(metadata);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_polls_updated_at
    BEFORE UPDATE ON polls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poll_options_updated_at
    BEFORE UPDATE ON poll_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update vote_count on poll_options when a vote is added/removed
CREATE OR REPLACE FUNCTION update_poll_option_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE poll_options 
        SET vote_count = vote_count + 1 
        WHERE id = NEW.poll_option_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE poll_options 
        SET vote_count = vote_count - 1 
        WHERE id = OLD.poll_option_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply vote count trigger
CREATE TRIGGER update_vote_count_on_vote
    AFTER INSERT OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_poll_option_vote_count();

-- Function to validate poll status transitions
CREATE OR REPLACE FUNCTION validate_poll_status_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Set closed_at timestamp when poll is closed
    IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
        NEW.closed_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Prevent reopening a closed poll
    IF OLD.status = 'closed' AND NEW.status != 'closed' AND NEW.status != 'archived' THEN
        RAISE EXCEPTION 'Cannot reopen a closed poll';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply poll status validation trigger
CREATE TRIGGER validate_poll_status
    BEFORE UPDATE ON polls
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION validate_poll_status_transition();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for active polls with vote counts
CREATE OR REPLACE VIEW active_polls_summary AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.creator_id,
    u.username as creator_username,
    p.status,
    p.is_public,
    p.is_anonymous,
    p.starts_at,
    p.ends_at,
    p.created_at,
    p.view_count,
    COUNT(DISTINCT po.id) as option_count,
    COALESCE(SUM(po.vote_count), 0) as total_votes
FROM polls p
JOIN users u ON p.creator_id = u.id
LEFT JOIN poll_options po ON p.id = po.poll_id
WHERE p.status = 'active'
GROUP BY p.id, u.username;

-- View for poll results
CREATE OR REPLACE VIEW poll_results AS
SELECT 
    p.id as poll_id,
    p.title as poll_title,
    po.id as option_id,
    po.option_text,
    po.vote_count,
    CASE 
        WHEN SUM(po.vote_count) OVER (PARTITION BY p.id) = 0 THEN 0
        ELSE ROUND(
            (po.vote_count::NUMERIC / SUM(po.vote_count) OVER (PARTITION BY p.id)) * 100, 
            2
        )
    END as vote_percentage
FROM polls p
JOIN poll_options po ON p.id = po.poll_id
ORDER BY p.id, po.option_order;

-- View for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.username,
    u.role,
    u.created_at,
    COUNT(DISTINCT p.id) as polls_created,
    COUNT(DISTINCT v.id) as votes_cast,
    COUNT(DISTINCT r.id) as reports_submitted
FROM users u
LEFT JOIN polls p ON u.id = p.creator_id
LEFT JOIN votes v ON u.id = v.user_id
LEFT JOIN reports r ON u.id = r.reporter_id
GROUP BY u.id, u.username, u.role, u.created_at;

-- ============================================================================
-- COMMENTS
-- ============================================================================

-- Table comments
COMMENT ON TABLE users IS 'Stores user accounts with authentication and profile information';
COMMENT ON TABLE polls IS 'Stores poll metadata including settings and scheduling';
COMMENT ON TABLE poll_options IS 'Stores individual choices/options for each poll';
COMMENT ON TABLE votes IS 'Records all votes cast by users on poll options';
COMMENT ON TABLE reports IS 'Stores user-submitted reports for content moderation';
COMMENT ON TABLE admin_logs IS 'Audit trail of all administrative actions in the system';

-- Column comments for users table
COMMENT ON COLUMN users.password_hash IS 'Bcrypt or Argon2 hashed password';
COMMENT ON COLUMN users.is_verified IS 'Email verification status';
COMMENT ON COLUMN users.banned_at IS 'Timestamp when user was banned, NULL if not banned';

-- Column comments for polls table
COMMENT ON COLUMN polls.is_anonymous IS 'If true, votes are not associated with user identities';
COMMENT ON COLUMN polls.allow_multiple_votes IS 'If true, users can vote for multiple options';
COMMENT ON COLUMN polls.max_votes_per_user IS 'Maximum number of votes a user can cast on this poll';

-- Column comments for votes table
COMMENT ON COLUMN votes.user_id IS 'NULL for anonymous polls or deleted users';
COMMENT ON COLUMN votes.ip_address IS 'Stored for fraud detection and analytics';

-- ============================================================================
-- GRANTS (Example - adjust based on your security requirements)
-- ============================================================================

-- Create roles (if not exists)
-- CREATE ROLE polling_app_user;
-- CREATE ROLE polling_app_admin;

-- Grant permissions to application user role
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO polling_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO polling_app_user;

-- Grant all permissions to admin role
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO polling_app_admin;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO polling_app_admin;
