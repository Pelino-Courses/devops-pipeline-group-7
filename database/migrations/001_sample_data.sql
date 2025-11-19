-- Sample Data Migration
-- This file contains sample data for testing and development purposes
-- DO NOT use this in production!

-- ============================================================================
-- SAMPLE USERS
-- ============================================================================

-- Insert sample users
-- Note: These passwords are hashed versions of "password123" - DO NOT USE IN PRODUCTION
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active, is_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin_user', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7DeXQ7bGju', 'Admin User', 'admin', true, true),
    ('550e8400-e29b-41d4-a716-446655440002', 'john_doe', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7DeXQ7bGju', 'John Doe', 'user', true, true),
    ('550e8400-e29b-41d4-a716-446655440003', 'jane_smith', 'jane@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7DeXQ7bGju', 'Jane Smith', 'moderator', true, true),
    ('550e8400-e29b-41d4-a716-446655440004', 'bob_wilson', 'bob@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7DeXQ7bGju', 'Bob Wilson', 'user', true, true),
    ('550e8400-e29b-41d4-a716-446655440005', 'alice_brown', 'alice@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7DeXQ7bGju', 'Alice Brown', 'user', true, false);

-- ============================================================================
-- SAMPLE POLLS
-- ============================================================================

-- Insert sample polls
INSERT INTO polls (id, title, description, creator_id, status, is_public, is_anonymous, allow_multiple_votes, max_votes_per_user, starts_at, ends_at) VALUES
    (
        '650e8400-e29b-41d4-a716-446655440001',
        'What is your favorite programming language?',
        'Help us understand which programming language developers prefer for web development in 2024.',
        '550e8400-e29b-41d4-a716-446655440002',
        'active',
        true,
        false,
        false,
        1,
        CURRENT_TIMESTAMP - INTERVAL '1 day',
        CURRENT_TIMESTAMP + INTERVAL '7 days'
    ),
    (
        '650e8400-e29b-41d4-a716-446655440002',
        'Best time for team meetings?',
        'Vote for the most convenient time for weekly team meetings.',
        '550e8400-e29b-41d4-a716-446655440003',
        'active',
        false,
        false,
        false,
        1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP + INTERVAL '3 days'
    ),
    (
        '650e8400-e29b-41d4-a716-446655440003',
        'Which features should we prioritize?',
        'Multiple choice poll - vote for up to 3 features you want to see next.',
        '550e8400-e29b-41d4-a716-446655440001',
        'active',
        true,
        false,
        true,
        3,
        CURRENT_TIMESTAMP - INTERVAL '2 days',
        CURRENT_TIMESTAMP + INTERVAL '5 days'
    ),
    (
        '650e8400-e29b-41d4-a716-446655440004',
        'What is your preferred IDE?',
        'Anonymous poll about IDE preferences.',
        '550e8400-e29b-41d4-a716-446655440004',
        'active',
        true,
        true,
        false,
        1,
        CURRENT_TIMESTAMP - INTERVAL '3 days',
        CURRENT_TIMESTAMP + INTERVAL '4 days'
    ),
    (
        '650e8400-e29b-41d4-a716-446655440005',
        'Rate our service',
        'This poll has been closed.',
        '550e8400-e29b-41d4-a716-446655440002',
        'closed',
        true,
        false,
        false,
        1,
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        CURRENT_TIMESTAMP - INTERVAL '3 days'
    );

-- ============================================================================
-- SAMPLE POLL OPTIONS
-- ============================================================================

-- Options for Poll 1: Favorite programming language
INSERT INTO poll_options (id, poll_id, option_text, option_order) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'JavaScript', 1),
    ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Python', 2),
    ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'Java', 3),
    ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'Go', 4),
    ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 'TypeScript', 5);

-- Options for Poll 2: Meeting times
INSERT INTO poll_options (id, poll_id, option_text, option_order) VALUES
    ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', '9:00 AM', 1),
    ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', '2:00 PM', 2),
    ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002', '4:00 PM', 3);

-- Options for Poll 3: Feature priorities
INSERT INTO poll_options (id, poll_id, option_text, option_order) VALUES
    ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440003', 'Dark mode', 1),
    ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440003', 'Mobile app', 2),
    ('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440003', 'Export results to PDF', 3),
    ('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440003', 'Real-time results', 4),
    ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440003', 'Custom themes', 5);

-- Options for Poll 4: IDE preferences
INSERT INTO poll_options (id, poll_id, option_text, option_order) VALUES
    ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440004', 'VS Code', 1),
    ('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440004', 'IntelliJ IDEA', 2),
    ('750e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440004', 'PyCharm', 3),
    ('750e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440004', 'Sublime Text', 4),
    ('750e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440004', 'Vim/Neovim', 5);

-- Options for Poll 5: Closed poll
INSERT INTO poll_options (id, poll_id, option_text, option_order) VALUES
    ('750e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440005', 'Excellent', 1),
    ('750e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440005', 'Good', 2),
    ('750e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440005', 'Fair', 3),
    ('750e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440005', 'Poor', 4);

-- ============================================================================
-- SAMPLE VOTES
-- ============================================================================

-- Votes for Poll 1 (Programming languages)
INSERT INTO votes (poll_id, poll_option_id, user_id, ip_address) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '192.168.1.100'),
    ('650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '192.168.1.101'),
    ('650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '192.168.1.102'),
    ('650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '192.168.1.103');

-- Votes for Poll 2 (Meeting times)
INSERT INTO votes (poll_id, poll_option_id, user_id, ip_address) VALUES
    ('650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', '192.168.1.100'),
    ('650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', '192.168.1.102');

-- Votes for Poll 3 (Feature priorities - multiple votes allowed)
INSERT INTO votes (poll_id, poll_option_id, user_id, ip_address) VALUES
    ('650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', '192.168.1.100'),
    ('650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', '192.168.1.100'),
    ('650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', '192.168.1.100'),
    ('650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', '192.168.1.101'),
    ('650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', '192.168.1.101');

-- Votes for Poll 4 (IDE - anonymous)
INSERT INTO votes (poll_id, poll_option_id, user_id, ip_address) VALUES
    ('650e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440014', NULL, '192.168.1.104'),
    ('650e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440014', NULL, '192.168.1.105'),
    ('650e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440015', NULL, '192.168.1.106'),
    ('650e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440018', NULL, '192.168.1.107');

-- Votes for Poll 5 (Closed poll)
INSERT INTO votes (poll_id, poll_option_id, user_id, ip_address) VALUES
    ('650e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440002', '192.168.1.100'),
    ('650e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440003', '192.168.1.101'),
    ('650e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440004', '192.168.1.102');

-- ============================================================================
-- SAMPLE REPORTS
-- ============================================================================

-- Sample reports
INSERT INTO reports (reporter_id, reported_poll_id, report_type, status, reason, description) VALUES
    (
        '550e8400-e29b-41d4-a716-446655440004',
        '650e8400-e29b-41d4-a716-446655440001',
        'poll',
        'pending',
        'Misleading options',
        'The poll options are biased and do not represent all popular programming languages.'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440005',
        '650e8400-e29b-41d4-a716-446655440004',
        'poll',
        'reviewed',
        'Inappropriate content',
        'Contains potentially offensive material.'
    );

-- ============================================================================
-- SAMPLE ADMIN LOGS
-- ============================================================================

-- Sample admin actions
INSERT INTO admin_logs (admin_id, action_type, target_poll_id, action_description, metadata, ip_address) VALUES
    (
        '550e8400-e29b-41d4-a716-446655440001',
        'poll_closed',
        '650e8400-e29b-41d4-a716-446655440005',
        'Manually closed poll after voting period ended',
        '{"reason": "scheduled_end", "vote_count": 3}'::jsonb,
        '10.0.0.1'
    ),
    (
        '550e8400-e29b-41d4-a716-446655440003',
        'report_reviewed',
        NULL,
        'Reviewed report for poll content',
        '{"report_id": "uuid-here", "decision": "no_action_needed"}'::jsonb,
        '10.0.0.2'
    );

-- Update view count for polls (simulating views)
UPDATE polls SET view_count = 245 WHERE id = '650e8400-e29b-41d4-a716-446655440001';
UPDATE polls SET view_count = 67 WHERE id = '650e8400-e29b-41d4-a716-446655440002';
UPDATE polls SET view_count = 189 WHERE id = '650e8400-e29b-41d4-a716-446655440003';
UPDATE polls SET view_count = 312 WHERE id = '650e8400-e29b-41d4-a716-446655440004';
UPDATE polls SET view_count = 98 WHERE id = '650e8400-e29b-41d4-a716-446655440005';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Uncomment these queries to verify the sample data was inserted correctly

-- SELECT COUNT(*) as user_count FROM users;
-- SELECT COUNT(*) as poll_count FROM polls;
-- SELECT COUNT(*) as option_count FROM poll_options;
-- SELECT COUNT(*) as vote_count FROM votes;
-- SELECT COUNT(*) as report_count FROM reports;
-- SELECT COUNT(*) as log_count FROM admin_logs;

-- SELECT * FROM active_polls_summary;
-- SELECT * FROM poll_results WHERE poll_id = '650e8400-e29b-41d4-a716-446655440001';
-- SELECT * FROM user_statistics;
