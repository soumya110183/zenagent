-- Zengent AI Database Verification Script
-- Run this after importing the database to verify everything is set up correctly

-- Check all tables exist
SELECT 
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check record counts
SELECT 'projects' as table_name, COUNT(*) as record_count FROM projects
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'source_files', COUNT(*) FROM source_files
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions;

-- Check project types distribution
SELECT 
    project_type,
    COUNT(*) as count,
    ROUND(AVG(file_count)) as avg_files,
    ROUND(AVG(controller_count)) as avg_controllers,
    ROUND(AVG(service_count)) as avg_services
FROM projects
GROUP BY project_type;

-- Check project status
SELECT 
    status,
    COUNT(*) as count
FROM projects
GROUP BY status;

-- Check source file languages
SELECT 
    language,
    COUNT(*) as file_count,
    ROUND(AVG(file_size)) as avg_size_bytes
FROM source_files
GROUP BY language
ORDER BY file_count DESC;

-- Check user accounts
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE is_active = true) as active_users,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_users
FROM users;

-- Show recent projects
SELECT 
    id,
    name,
    project_type,
    source_type,
    status,
    file_count,
    uploaded_at
FROM projects
ORDER BY uploaded_at DESC
LIMIT 5;

-- Database size information
SELECT 
    pg_size_pretty(pg_database_size('zengent_ai')) as database_size;

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
