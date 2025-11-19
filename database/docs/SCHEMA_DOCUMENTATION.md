# PostgreSQL Database Schema Documentation

## Overview

This document provides comprehensive documentation for the PostgreSQL database schema designed for a polling/voting application. The schema supports user management, poll creation and management, voting, content reporting, and administrative auditing.

## Table of Contents

1. [Database Structure](#database-structure)
2. [Table Descriptions](#table-descriptions)
3. [Relationships](#relationships)
4. [Indexes and Performance](#indexes-and-performance)
5. [Triggers and Functions](#triggers-and-functions)
6. [Views](#views)
7. [Security and Permissions](#security-and-permissions)
8. [Usage Examples](#usage-examples)

## Database Structure

The database consists of six main tables:

1. **users** - User accounts and authentication
2. **polls** - Poll definitions and metadata
3. **poll_options** - Individual options/choices for each poll
4. **votes** - Vote records
5. **reports** - Content moderation reports
6. **admin_logs** - Administrative action audit trail

## Table Descriptions

### 1. Users Table

**Purpose**: Stores user account information, authentication credentials, and profile data.

**Key Fields**:
- `id` (UUID): Unique identifier for each user
- `username` (VARCHAR): Unique username (minimum 3 characters)
- `email` (VARCHAR): Unique email address with validation
- `password_hash` (VARCHAR): Securely hashed password (use bcrypt or Argon2)
- `role` (ENUM): User role - `user`, `moderator`, or `admin`
- `is_active` (BOOLEAN): Account active status
- `is_verified` (BOOLEAN): Email verification status
- `banned_at` (TIMESTAMP): When user was banned (NULL if not banned)

**Business Rules**:
- Usernames must be at least 3 characters long
- Email addresses must follow standard email format
- Passwords are never stored in plain text
- Deleted users can be soft-deleted by setting `is_active` to false
- Ban information (timestamp and reason) is preserved for audit purposes

### 2. Polls Table

**Purpose**: Stores poll metadata including title, description, creator, status, and voting rules.

**Key Fields**:
- `id` (UUID): Unique identifier for each poll
- `title` (VARCHAR): Poll title/question
- `description` (TEXT): Detailed poll description
- `creator_id` (UUID): Foreign key to users table
- `status` (ENUM): Poll status - `draft`, `active`, `closed`, or `archived`
- `is_public` (BOOLEAN): Whether poll is publicly visible
- `is_anonymous` (BOOLEAN): Whether votes are anonymous
- `allow_multiple_votes` (BOOLEAN): Allow users to vote for multiple options
- `max_votes_per_user` (INTEGER): Maximum votes per user (when multiple votes allowed)
- `starts_at` / `ends_at` (TIMESTAMP): Poll scheduling
- `view_count` (INTEGER): Number of times poll was viewed

**Business Rules**:
- Poll must have a non-empty title
- If both start and end dates are set, end date must be after start date
- Max votes per user must be positive
- Poll creator is stored; polls are deleted if creator is deleted (CASCADE)
- Poll can only transition to archived from closed status
- Closed polls cannot be reopened

### 3. Poll Options Table

**Purpose**: Stores individual options/choices that users can vote on for each poll.

**Key Fields**:
- `id` (UUID): Unique identifier for each option
- `poll_id` (UUID): Foreign key to polls table
- `option_text` (VARCHAR): The text of the option
- `option_order` (INTEGER): Display order for the option
- `image_url` (TEXT): Optional image for the option
- `vote_count` (INTEGER): Cached count of votes (automatically updated)

**Business Rules**:
- Option text cannot be empty
- Each option must belong to exactly one poll
- Options are deleted when their parent poll is deleted (CASCADE)
- Option order must be unique within a poll
- Vote count is automatically maintained by triggers
- Vote count cannot be negative

### 4. Votes Table

**Purpose**: Records individual votes cast by users on poll options.

**Key Fields**:
- `id` (UUID): Unique identifier for each vote
- `poll_id` (UUID): Foreign key to polls table
- `poll_option_id` (UUID): Foreign key to poll_options table
- `user_id` (UUID): Foreign key to users table (NULL for anonymous votes or deleted users)
- `ip_address` (INET): IP address of voter (for fraud detection)
- `user_agent` (TEXT): Browser/client information
- `voted_at` (TIMESTAMP): When vote was cast

**Business Rules**:
- Each user can only vote once per poll option (enforced by unique constraint)
- Votes are preserved even if user is deleted (user_id set to NULL)
- Votes are deleted when poll or poll option is deleted (CASCADE)
- IP address and user agent are stored for analytics and fraud detection
- For anonymous polls, votes may not have user_id set

### 5. Reports Table

**Purpose**: Stores user-submitted reports for content moderation and abuse prevention.

**Key Fields**:
- `id` (UUID): Unique identifier for each report
- `reporter_id` (UUID): User who submitted the report
- `reported_user_id` (UUID): User being reported (if applicable)
- `reported_poll_id` (UUID): Poll being reported (if applicable)
- `report_type` (ENUM): Type - `poll`, `comment`, `user`, or `other`
- `status` (ENUM): Report status - `pending`, `reviewed`, `resolved`, or `dismissed`
- `reason` (TEXT): Short reason for report
- `description` (TEXT): Detailed description
- `reviewed_by_id` (UUID): Admin/moderator who reviewed
- `resolution_notes` (TEXT): Notes from reviewer
- `reviewed_at` / `resolved_at` (TIMESTAMP): When report was processed

**Business Rules**:
- Report must have at least one target (user or poll)
- Reason field is required and cannot be empty
- Report can target both a user and a poll simultaneously
- Reporter and reviewer information preserved even if users deleted (SET NULL)
- Reported content is deleted if it's deleted from system (CASCADE for targets)

### 6. Admin Logs Table

**Purpose**: Provides comprehensive audit trail of all administrative actions in the system.

**Key Fields**:
- `id` (UUID): Unique identifier for each log entry
- `admin_id` (UUID): User who performed the action
- `action_type` (ENUM): Type of action performed
- `target_user_id` / `target_poll_id` / `target_report_id` (UUID): Target of action
- `action_description` (TEXT): Human-readable description
- `metadata` (JSONB): Additional structured data about the action
- `ip_address` (INET): Admin's IP address
- `user_agent` (TEXT): Admin's browser/client

**Business Rules**:
- All administrative actions should be logged
- Action description is required
- Metadata field allows flexible storage of action-specific data
- Log entries are preserved even if admin or targets are deleted (SET NULL)
- Logs are append-only (no updates or deletes)

## Relationships

### Foreign Key Relationships

```
users (creator) → polls (1:Many)
users (voter) → votes (1:Many)
users (reporter) → reports (1:Many)
users (reported) → reports (1:Many)
users (reviewer) → reports (1:Many)
users (admin) → admin_logs (1:Many)

polls → poll_options (1:Many)
polls → votes (1:Many)
polls → reports (target) (1:Many)
polls → admin_logs (target) (1:Many)

poll_options → votes (1:Many)

reports → admin_logs (target) (1:Many)
```

### Cascade Rules

- **ON DELETE CASCADE**: Used when child records should be deleted with parent
  - polls → poll_options
  - polls → votes
  - users (creator) → polls
  - users (reported) → reports
  - poll_options → votes

- **ON DELETE SET NULL**: Used to preserve records when referenced entity is deleted
  - users → votes (preserves vote records)
  - users → reports (preserves report history)
  - users → admin_logs (preserves audit trail)

## Indexes and Performance

### Primary Indexes
All tables have UUID primary keys with automatic indexing.

### Foreign Key Indexes
All foreign keys are indexed for optimal join performance:
- `polls.creator_id`
- `poll_options.poll_id`
- `votes.poll_id`, `votes.poll_option_id`, `votes.user_id`
- `reports.reporter_id`, `reports.reported_user_id`, `reports.reported_poll_id`
- `admin_logs.admin_id`, `admin_logs.target_*_id`

### Composite Indexes
- `poll_options(poll_id, option_order)` - For ordered option retrieval

### Partial Indexes
- `users(is_active) WHERE is_active = true` - For active user queries
- `polls(is_public) WHERE is_public = true` - For public poll queries

### Special Indexes
- GIN index on `admin_logs.metadata` - For JSONB queries

### Timestamp Indexes
All `created_at` fields are indexed in descending order for recent-first queries.

## Triggers and Functions

### 1. Auto-update Updated_at Timestamp

**Function**: `update_updated_at_column()`

**Tables**: users, polls, poll_options, reports

**Purpose**: Automatically sets `updated_at` to current timestamp on every UPDATE.

### 2. Maintain Vote Counts

**Function**: `update_poll_option_vote_count()`

**Table**: votes (triggers on INSERT and DELETE)

**Purpose**: Automatically increments/decrements `vote_count` on poll_options when votes are added or removed.

### 3. Validate Poll Status Transitions

**Function**: `validate_poll_status_transition()`

**Table**: polls (triggers on UPDATE when status changes)

**Purpose**: 
- Sets `closed_at` timestamp when poll is closed
- Prevents reopening closed polls
- Enforces valid status transitions

## Views

### 1. active_polls_summary

Shows summary information for all active polls including vote counts.

**Columns**:
- Poll basic information (id, title, description, creator)
- Creator username
- Poll settings and dates
- Aggregated statistics (option_count, total_votes)

**Use Case**: Dashboard, poll listing pages

### 2. poll_results

Shows detailed voting results for all polls with vote percentages.

**Columns**:
- Poll and option information
- Vote counts
- Calculated vote percentages

**Use Case**: Results display, analytics

### 3. user_statistics

Aggregates user activity across the system.

**Columns**:
- User information
- Polls created count
- Votes cast count
- Reports submitted count

**Use Case**: User profiles, leaderboards, analytics

## Security and Permissions

### Password Security
- Passwords must be hashed using bcrypt or Argon2
- Never store plain text passwords
- Password hash length accommodates algorithm overhead

### Row-Level Security (RLS)
While not implemented in the base schema, PostgreSQL RLS can be added for:
- Restricting poll visibility based on `is_public` flag
- Limiting user access to their own data
- Enforcing role-based access control

### Recommended Roles

```sql
-- Application user (read/write access)
CREATE ROLE polling_app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES TO polling_app_user;

-- Admin user (full access)
CREATE ROLE polling_app_admin;
GRANT ALL PRIVILEGES ON ALL TABLES TO polling_app_admin;

-- Read-only analytics role
CREATE ROLE polling_app_analytics;
GRANT SELECT ON ALL TABLES TO polling_app_analytics;
```

## Usage Examples

### Creating a New Poll with Options

```sql
-- Create user
INSERT INTO users (username, email, password_hash, full_name)
VALUES ('john_doe', 'john@example.com', '$2b$12$...', 'John Doe')
RETURNING id;

-- Create poll
INSERT INTO polls (title, description, creator_id, status)
VALUES (
    'What is your favorite programming language?',
    'Vote for your preferred language for web development',
    'user-uuid-here',
    'active'
)
RETURNING id;

-- Add options
INSERT INTO poll_options (poll_id, option_text, option_order)
VALUES 
    ('poll-uuid-here', 'JavaScript', 1),
    ('poll-uuid-here', 'Python', 2),
    ('poll-uuid-here', 'Java', 3),
    ('poll-uuid-here', 'Go', 4);
```

### Casting a Vote

```sql
INSERT INTO votes (poll_id, poll_option_id, user_id, ip_address)
VALUES (
    'poll-uuid-here',
    'option-uuid-here',
    'user-uuid-here',
    '192.168.1.1'
);
-- Vote count on poll_option is automatically incremented by trigger
```

### Viewing Poll Results

```sql
SELECT * FROM poll_results
WHERE poll_id = 'poll-uuid-here'
ORDER BY vote_percentage DESC;
```

### Reporting Content

```sql
INSERT INTO reports (
    reporter_id,
    reported_poll_id,
    report_type,
    reason,
    description
)
VALUES (
    'reporter-user-uuid',
    'poll-uuid-here',
    'poll',
    'Inappropriate content',
    'This poll contains offensive language'
);
```

### Logging Admin Action

```sql
INSERT INTO admin_logs (
    admin_id,
    action_type,
    target_poll_id,
    action_description,
    metadata
)
VALUES (
    'admin-user-uuid',
    'poll_deleted',
    'poll-uuid-here',
    'Deleted poll due to policy violation',
    '{"reason": "spam", "reporter_count": 5}'::jsonb
);
```

### Querying Active Polls

```sql
SELECT * FROM active_polls_summary
WHERE is_public = true
  AND (ends_at IS NULL OR ends_at > CURRENT_TIMESTAMP)
ORDER BY created_at DESC
LIMIT 10;
```

### Getting User Statistics

```sql
SELECT * FROM user_statistics
WHERE username = 'john_doe';
```

## Migration Strategy

### Initial Setup

1. Create database and enable extensions
2. Execute schema.sql to create all tables, types, and indexes
3. Create triggers and functions
4. Create views
5. Set up roles and permissions
6. Insert seed data if needed

### Future Migrations

For schema changes, use migration tools like:
- Flyway
- Liquibase
- Alembic (Python)
- TypeORM/Sequelize migrations (JavaScript)

Always:
- Version control your migrations
- Test migrations on staging before production
- Create rollback scripts
- Backup database before migrations

## Performance Considerations

### Query Optimization
- Use prepared statements to prevent SQL injection and improve performance
- Leverage indexes for filtering and joins
- Use views for complex queries that are frequently executed
- Consider materialized views for expensive aggregations

### Scaling Strategies
1. **Vertical Scaling**: Increase database server resources
2. **Read Replicas**: For read-heavy workloads
3. **Connection Pooling**: Use pgBouncer or similar
4. **Partitioning**: Partition large tables (votes, admin_logs) by date
5. **Archiving**: Move old closed polls to archive tables

### Monitoring
Monitor these metrics:
- Query performance (slow query log)
- Index usage
- Table sizes and growth
- Connection pool usage
- Cache hit ratios

## Backup and Recovery

### Recommended Backup Strategy

1. **Full Backups**: Daily using pg_dump or pg_basebackup
2. **Point-in-Time Recovery**: Enable WAL archiving
3. **Testing**: Regularly test restore procedures
4. **Retention**: Keep backups for at least 30 days

### Example Backup Command

```bash
pg_dump -U postgres -d polling_db -F c -f polling_db_backup.dump
```

### Example Restore Command

```bash
pg_restore -U postgres -d polling_db -c polling_db_backup.dump
```

## Maintenance

### Regular Maintenance Tasks

1. **VACUUM**: Run regularly to reclaim space
   ```sql
   VACUUM ANALYZE;
   ```

2. **REINDEX**: Rebuild indexes periodically
   ```sql
   REINDEX DATABASE polling_db;
   ```

3. **Update Statistics**: Keep query planner statistics current
   ```sql
   ANALYZE;
   ```

4. **Monitor Bloat**: Check for table and index bloat

## Conclusion

This database schema provides a robust foundation for a polling application with:
- User management and authentication
- Flexible poll creation with multiple options
- Secure voting with fraud prevention
- Content moderation through reports
- Comprehensive audit logging
- Performance optimization through indexes and triggers
- Data integrity through constraints and foreign keys

The schema is designed to be scalable, maintainable, and secure while providing the flexibility needed for a modern polling application.
