# Database Quick Reference Guide

## Tables at a Glance

| Table | Purpose | Key Fields | Relationships |
|-------|---------|------------|---------------|
| **users** | User accounts | username, email, role | Creates polls, casts votes, submits reports |
| **polls** | Poll definitions | title, status, creator_id | Has many options, receives votes |
| **poll_options** | Poll choices | option_text, vote_count | Belongs to poll, receives votes |
| **votes** | Vote records | user_id, poll_option_id | Belongs to user, poll, and option |
| **reports** | Content reports | reporter_id, status, reason | Submitted by users, targets users/polls |
| **admin_logs** | Audit trail | admin_id, action_type | Tracks all admin actions |

## ENUMs Reference

### user_role
```sql
'user' | 'moderator' | 'admin'
```

### poll_status
```sql
'draft' | 'active' | 'closed' | 'archived'
```

### report_status
```sql
'pending' | 'reviewed' | 'resolved' | 'dismissed'
```

### report_type
```sql
'poll' | 'comment' | 'user' | 'other'
```

### admin_action_type
```sql
'user_created' | 'user_updated' | 'user_deleted' | 'user_banned' | 'user_unbanned'
'poll_created' | 'poll_updated' | 'poll_deleted' | 'poll_closed'
'report_reviewed' | 'report_resolved' | 'report_dismissed'
'content_moderated' | 'settings_changed' | 'other'
```

## Common Queries

### 1. Get All Active Polls
```sql
SELECT * FROM polls 
WHERE status = 'active' 
  AND is_public = true
  AND (ends_at IS NULL OR ends_at > CURRENT_TIMESTAMP)
ORDER BY created_at DESC;
```

### 2. Get Poll with Results
```sql
SELECT 
    p.title,
    po.option_text,
    po.vote_count,
    ROUND(
        CASE 
            WHEN SUM(po.vote_count) OVER (PARTITION BY p.id) = 0 THEN 0
            ELSE (po.vote_count::NUMERIC / SUM(po.vote_count) OVER (PARTITION BY p.id)) * 100
        END, 
        2
    ) as percentage
FROM polls p
JOIN poll_options po ON p.id = po.poll_id
WHERE p.id = :poll_id
ORDER BY po.vote_count DESC;
```

### 3. Cast a Vote
```sql
-- Check if user already voted for this poll
SELECT COUNT(*) FROM votes 
WHERE user_id = :user_id AND poll_id = :poll_id;

-- If not voted yet, insert vote
INSERT INTO votes (poll_id, poll_option_id, user_id, ip_address)
VALUES (:poll_id, :option_id, :user_id, :ip_address);
```

### 4. Get User's Polls
```sql
SELECT p.*, COUNT(DISTINCT v.id) as total_votes
FROM polls p
LEFT JOIN votes v ON p.id = v.poll_id
WHERE p.creator_id = :user_id
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### 5. Get Pending Reports
```sql
SELECT 
    r.*,
    reporter.username as reporter_name,
    COALESCE(
        reported_user.username, 
        reported_poll.title
    ) as target_name
FROM reports r
LEFT JOIN users reporter ON r.reporter_id = reporter.id
LEFT JOIN users reported_user ON r.reported_user_id = reported_user.id
LEFT JOIN polls reported_poll ON r.reported_poll_id = reported_poll.id
WHERE r.status = 'pending'
ORDER BY r.created_at ASC;
```

### 6. Get Recent Admin Actions
```sql
SELECT 
    al.*,
    u.username as admin_name
FROM admin_logs al
JOIN users u ON al.admin_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;
```

### 7. Get Top Voters
```sql
SELECT 
    u.username,
    COUNT(v.id) as vote_count
FROM users u
JOIN votes v ON u.id = v.user_id
GROUP BY u.id, u.username
ORDER BY vote_count DESC
LIMIT 10;
```

### 8. Get Most Popular Polls
```sql
SELECT 
    p.title,
    p.view_count,
    COUNT(DISTINCT v.id) as vote_count,
    COUNT(DISTINCT v.user_id) as unique_voters
FROM polls p
LEFT JOIN votes v ON p.id = v.poll_id
WHERE p.status = 'active'
GROUP BY p.id
ORDER BY vote_count DESC
LIMIT 10;
```

## Constraints Reference

### Unique Constraints
- `users.username` - Each username must be unique
- `users.email` - Each email must be unique
- `votes(user_id, poll_option_id)` - User can only vote once per option
- `poll_options(poll_id, option_order)` - Option order unique within poll

### Check Constraints
- `users.username` - Minimum 3 characters
- `users.email` - Valid email format
- `polls.title` - Non-empty after trimming
- `polls.ends_at` - Must be after starts_at (if both set)
- `polls.max_votes_per_user` - Must be positive
- `poll_options.option_text` - Non-empty after trimming
- `poll_options.vote_count` - Cannot be negative
- `reports.reason` - Non-empty after trimming
- `reports` - At least one target (user or poll) required

### Foreign Key Cascade Rules

**ON DELETE CASCADE** (child deleted with parent):
- `polls.creator_id` → `users.id`
- `poll_options.poll_id` → `polls.id`
- `votes.poll_id` → `polls.id`
- `votes.poll_option_id` → `poll_options.id`
- `reports.reported_user_id` → `users.id`
- `reports.reported_poll_id` → `polls.id`

**ON DELETE SET NULL** (preserve child, clear reference):
- `votes.user_id` → `users.id`
- `reports.reporter_id` → `users.id`
- `reports.reviewed_by_id` → `users.id`
- `admin_logs.admin_id` → `users.id`
- `admin_logs.target_*_id` → respective tables

## Indexes Reference

### Primary Keys
- All tables have UUID primary key with automatic index

### Foreign Keys (all indexed)
- `polls.creator_id`
- `poll_options.poll_id`
- `votes.poll_id`, `votes.poll_option_id`, `votes.user_id`
- `reports.reporter_id`, `reports.reported_user_id`, `reports.reported_poll_id`, `reports.reviewed_by_id`
- `admin_logs.admin_id`, `admin_logs.target_user_id`, `admin_logs.target_poll_id`, `admin_logs.target_report_id`

### Additional Indexes
- `users.email`, `users.username` - Login lookups
- `users.role` - Role-based queries
- `polls.status` - Filter by status
- `polls.ends_at` - Scheduled poll queries
- `votes.ip_address` - Fraud detection
- `admin_logs.metadata` (GIN) - JSONB queries

### Partial Indexes
- `users(is_active) WHERE is_active = true`
- `polls(is_public) WHERE is_public = true`

## Triggers Reference

### 1. update_updated_at_column()
**Tables**: users, polls, poll_options, reports  
**When**: BEFORE UPDATE  
**Action**: Sets updated_at = CURRENT_TIMESTAMP

### 2. update_poll_option_vote_count()
**Table**: votes  
**When**: AFTER INSERT OR DELETE  
**Action**: Increments/decrements vote_count on poll_options

### 3. validate_poll_status_transition()
**Table**: polls  
**When**: BEFORE UPDATE (when status changes)  
**Action**: 
- Sets closed_at when status → 'closed'
- Prevents reopening closed polls
- Enforces valid status transitions

## Views Reference

### active_polls_summary
Shows active polls with aggregated statistics.

**Columns**:
- Poll info: id, title, description, creator_id, creator_username
- Settings: status, is_public, is_anonymous, starts_at, ends_at
- Stats: view_count, option_count, total_votes

**Usage**:
```sql
SELECT * FROM active_polls_summary 
WHERE is_public = true 
ORDER BY total_votes DESC;
```

### poll_results
Shows detailed voting results with percentages.

**Columns**:
- poll_id, poll_title
- option_id, option_text
- vote_count, vote_percentage

**Usage**:
```sql
SELECT * FROM poll_results 
WHERE poll_id = :poll_id 
ORDER BY vote_percentage DESC;
```

### user_statistics
Aggregates user activity metrics.

**Columns**:
- User info: id, username, role, created_at
- Stats: polls_created, votes_cast, reports_submitted

**Usage**:
```sql
SELECT * FROM user_statistics 
WHERE username = :username;
```

## Installation Commands

### Create Database
```bash
createdb polling_db
```

### Apply Schema
```bash
psql -U postgres -d polling_db -f database/schemas/schema.sql
```

### Load Sample Data
```bash
psql -U postgres -d polling_db -f database/migrations/001_sample_data.sql
```

### Drop Schema
```bash
psql -U postgres -d polling_db -f database/schemas/drop_schema.sql
```

### Backup Database
```bash
pg_dump -U postgres -d polling_db -F c -f polling_db_backup.dump
```

### Restore Database
```bash
pg_restore -U postgres -d polling_db -c polling_db_backup.dump
```

## Maintenance Commands

### Vacuum and Analyze
```sql
VACUUM ANALYZE;
```

### Reindex Database
```sql
REINDEX DATABASE polling_db;
```

### Check Table Sizes
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Usage
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

### Find Slow Queries
```sql
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Security Best Practices

1. **Never store plain text passwords** - Use bcrypt/Argon2
2. **Use parameterized queries** - Prevent SQL injection
3. **Implement row-level security** - For multi-tenant scenarios
4. **Grant minimum privileges** - Principle of least privilege
5. **Enable SSL connections** - For production databases
6. **Regular backups** - Automated daily backups
7. **Monitor audit logs** - Review admin_logs regularly
8. **Sanitize user input** - Before storing in database
9. **Rate limit API** - Prevent abuse and DoS
10. **Keep PostgreSQL updated** - Security patches

## Performance Tips

1. **Use connection pooling** - pgBouncer recommended
2. **Monitor slow queries** - Enable pg_stat_statements
3. **Regular VACUUM** - Prevent table bloat
4. **Use appropriate indexes** - All foreign keys indexed
5. **Partition large tables** - votes, admin_logs by date
6. **Use materialized views** - For expensive reports
7. **Cache frequently accessed data** - Application-level caching
8. **Denormalize when needed** - vote_count already denormalized
9. **Batch operations** - Insert multiple rows at once
10. **Monitor database metrics** - CPU, memory, disk I/O
