-- PostgreSQL Database Schema - DROP Script
-- Version: 1.0
-- WARNING: This script will DROP all tables, views, functions, and types
-- Use with caution! This will DELETE ALL DATA!

-- ============================================================================
-- DROP VIEWS
-- ============================================================================

DROP VIEW IF EXISTS user_statistics CASCADE;
DROP VIEW IF EXISTS poll_results CASCADE;
DROP VIEW IF EXISTS active_polls_summary CASCADE;

-- ============================================================================
-- DROP TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS validate_poll_status ON polls;
DROP TRIGGER IF EXISTS update_vote_count_on_vote ON votes;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
DROP TRIGGER IF EXISTS update_poll_options_updated_at ON poll_options;
DROP TRIGGER IF EXISTS update_polls_updated_at ON polls;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- ============================================================================
-- DROP FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS validate_poll_status_transition() CASCADE;
DROP FUNCTION IF EXISTS update_poll_option_vote_count() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- DROP TABLES
-- ============================================================================

DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS poll_options CASCADE;
DROP TABLE IF EXISTS polls CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- DROP TYPES
-- ============================================================================

DROP TYPE IF EXISTS admin_action_type CASCADE;
DROP TYPE IF EXISTS report_type CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS poll_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================================================
-- DROP EXTENSIONS (Optional - uncomment if you want to remove extensions)
-- ============================================================================

-- DROP EXTENSION IF EXISTS pgcrypto;
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- End of drop script
