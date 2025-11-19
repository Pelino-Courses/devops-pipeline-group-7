# Database Schema Documentation

This directory contains the complete PostgreSQL database schema for the polling application.

## Directory Structure

```
database/
├── docs/
│   ├── ERD.md                      # Entity Relationship Diagram (Mermaid format)
│   └── SCHEMA_DOCUMENTATION.md     # Comprehensive schema documentation
├── schemas/
│   ├── schema.sql                  # Main schema creation script
│   └── drop_schema.sql             # Schema cleanup script
└── migrations/
    └── 001_sample_data.sql         # Sample data for testing/development
```

## Quick Start

### 1. Prerequisites

- PostgreSQL 12 or higher installed
- Database created with UTF-8 encoding
- Superuser access (for creating extensions)

### 2. Create Database

```bash
# Create a new database
createdb polling_db

# Or using psql
psql -U postgres -c "CREATE DATABASE polling_db WITH ENCODING 'UTF8';"
```

### 3. Apply Schema

```bash
# Apply the schema
psql -U postgres -d polling_db -f database/schemas/schema.sql
```

### 4. Load Sample Data (Optional)

```bash
# Load sample data for testing
psql -U postgres -d polling_db -f database/migrations/001_sample_data.sql
```

### 5. Verify Installation

```bash
# Connect to database
psql -U postgres -d polling_db

# Check tables
\dt

# Check views
\dv

# Query sample data
SELECT * FROM active_polls_summary;
```

## Schema Overview

The database consists of six main tables:

### Core Tables

1. **users** - User accounts and authentication
   - Stores user credentials, profile information, and roles
   - Supports user, moderator, and admin roles
   - Email verification and account status tracking

2. **polls** - Poll definitions and metadata
   - Poll title, description, and settings
   - Support for public/private, anonymous, and multiple-choice polls
   - Poll scheduling with start and end dates
   - Status tracking (draft, active, closed, archived)

3. **poll_options** - Individual options for each poll
   - Option text and ordering
   - Automatic vote count tracking via triggers
   - Optional image support

4. **votes** - Vote records
   - Links users to their poll option choices
   - IP address tracking for fraud prevention
   - Supports anonymous voting
   - Prevents duplicate votes via unique constraints

5. **reports** - Content moderation reports
   - User-submitted reports for inappropriate content
   - Can target users or polls
   - Workflow tracking (pending, reviewed, resolved, dismissed)
   - Admin review and resolution notes

6. **admin_logs** - Administrative action audit trail
   - Comprehensive logging of all admin actions
   - Flexible metadata storage using JSONB
   - IP and user agent tracking
   - Links to affected entities (users, polls, reports)

## Key Features

### Security
- UUID primary keys for all tables
- Password hashing support (store bcrypt/Argon2 hashes)
- Email format validation
- Role-based access control (user, moderator, admin)
- Comprehensive audit logging

### Performance
- Indexes on all foreign keys
- Composite indexes for common queries
- Partial indexes for filtered queries
- Denormalized vote counts for fast retrieval

### Data Integrity
- Foreign key constraints with appropriate cascade rules
- Check constraints for data validation
- Unique constraints to prevent duplicates
- Automatic timestamp management via triggers

### Automation
- Auto-updating `updated_at` timestamps
- Automatic vote count maintenance
- Poll status validation and transition rules

## Database Features

### Custom Types (ENUMs)

The schema uses PostgreSQL ENUMs for type safety:

- `user_role`: user | moderator | admin
- `poll_status`: draft | active | closed | archived
- `report_status`: pending | reviewed | resolved | dismissed
- `report_type`: poll | comment | user | other
- `admin_action_type`: Various admin action types

### Views

Pre-built views for common queries:

1. **active_polls_summary**
   - Lists all active polls with aggregated statistics
   - Includes creator information and vote counts

2. **poll_results**
   - Shows voting results with percentages
   - Ordered by vote count

3. **user_statistics**
   - User activity metrics
   - Counts of polls created, votes cast, and reports submitted

### Triggers

Automated database operations:

1. **update_updated_at_column()**
   - Automatically updates `updated_at` on record changes
   - Applied to users, polls, poll_options, reports

2. **update_poll_option_vote_count()**
   - Maintains accurate vote counts on poll_options
   - Triggered on vote insert/delete

3. **validate_poll_status_transition()**
   - Enforces valid poll status transitions
   - Prevents reopening closed polls
   - Sets closed_at timestamp

## Documentation

### Detailed Documentation

- **[ERD.md](docs/ERD.md)** - Visual Entity Relationship Diagram with Mermaid syntax
- **[SCHEMA_DOCUMENTATION.md](docs/SCHEMA_DOCUMENTATION.md)** - Complete schema reference including:
  - Detailed table descriptions
  - Relationship explanations
  - Usage examples
  - Performance considerations
  - Security guidelines
  - Backup and maintenance procedures

### Viewing the ERD

The ERD is written in Mermaid syntax and can be viewed in:

1. **GitHub** - Automatically renders Mermaid diagrams
2. **VS Code** - Use the Mermaid Preview extension
3. **Mermaid Live Editor** - Copy/paste to https://mermaid.live
4. **Documentation sites** - Most modern doc platforms support Mermaid

## Common Operations

### Resetting the Database

```bash
# Drop all objects
psql -U postgres -d polling_db -f database/schemas/drop_schema.sql

# Recreate schema
psql -U postgres -d polling_db -f database/schemas/schema.sql

# Reload sample data
psql -U postgres -d polling_db -f database/migrations/001_sample_data.sql
```

### Backup and Restore

```bash
# Create backup
pg_dump -U postgres -d polling_db -F c -f polling_db_backup.dump

# Restore from backup
pg_restore -U postgres -d polling_db -c polling_db_backup.dump
```

### Maintenance

```bash
# Vacuum and analyze
psql -U postgres -d polling_db -c "VACUUM ANALYZE;"

# Reindex
psql -U postgres -d polling_db -c "REINDEX DATABASE polling_db;"
```

## Sample Queries

### Get Active Polls with Results

```sql
SELECT * FROM active_polls_summary
WHERE is_public = true
ORDER BY total_votes DESC
LIMIT 10;
```

### Get Poll Results with Percentages

```sql
SELECT * FROM poll_results
WHERE poll_id = 'your-poll-uuid-here'
ORDER BY vote_percentage DESC;
```

### Get User Statistics

```sql
SELECT * FROM user_statistics
WHERE username = 'john_doe';
```

### Get Recent Admin Actions

```sql
SELECT 
    al.*,
    u.username as admin_username
FROM admin_logs al
JOIN users u ON al.admin_id = u.id
ORDER BY al.created_at DESC
LIMIT 20;
```

### Get Pending Reports

```sql
SELECT 
    r.*,
    reporter.username as reporter_username,
    p.title as poll_title
FROM reports r
LEFT JOIN users reporter ON r.reporter_id = reporter.id
LEFT JOIN polls p ON r.reported_poll_id = p.id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;
```

## Migration Strategy

### For New Deployments

1. Create database
2. Run `schema.sql`
3. (Optional) Load sample data from `001_sample_data.sql`
4. Configure application connection

### For Existing Deployments

Use a migration tool like:
- **Flyway** (Java)
- **Liquibase** (Language-agnostic)
- **Alembic** (Python)
- **TypeORM** / **Sequelize** (Node.js)

Always:
- Version control your migrations
- Test on staging before production
- Create rollback scripts
- Backup before migrations

## Security Considerations

1. **Password Storage**
   - Never store plain text passwords
   - Use bcrypt or Argon2 for hashing
   - Minimum recommended bcrypt rounds: 12

2. **SQL Injection Prevention**
   - Always use parameterized queries
   - Never concatenate user input into SQL

3. **Access Control**
   - Use separate database users for application and admin
   - Grant minimum necessary privileges
   - Consider implementing Row-Level Security (RLS)

4. **Sensitive Data**
   - Be cautious with IP address storage (GDPR compliance)
   - Consider encryption for sensitive fields
   - Implement data retention policies

## Performance Optimization

### Index Usage

All foreign keys and frequently queried columns are indexed. Monitor query performance:

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

### Query Optimization

- Use EXPLAIN ANALYZE for slow queries
- Consider materialized views for expensive aggregations
- Partition large tables (votes, admin_logs) by date if needed

## Troubleshooting

### Common Issues

1. **Extension errors**
   ```
   ERROR: could not open extension control file
   ```
   **Solution**: Install PostgreSQL contrib package
   ```bash
   sudo apt-get install postgresql-contrib
   ```

2. **Permission errors**
   ```
   ERROR: permission denied for schema public
   ```
   **Solution**: Grant schema permissions
   ```sql
   GRANT ALL ON SCHEMA public TO your_user;
   ```

3. **Trigger not firing**
   - Check trigger is enabled: `SELECT * FROM pg_trigger;`
   - Verify function exists: `\df`

## Contributing

When making schema changes:

1. Document all changes in migration files
2. Update ERD.md to reflect new relationships
3. Update SCHEMA_DOCUMENTATION.md with new tables/columns
4. Add appropriate indexes
5. Test all constraints and triggers
6. Provide rollback scripts

## Support

For issues or questions:
- Review the documentation in `/docs`
- Check the sample queries above
- Consult PostgreSQL official documentation
- Review the comments in schema.sql

## License

[Your License Here]

## Version History

- **v1.0** (2024) - Initial schema design
  - Core tables: users, polls, poll_options, votes, reports, admin_logs
  - Full ERD and documentation
  - Sample data for testing
