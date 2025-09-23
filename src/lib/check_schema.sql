-- Show all tables
SHOW TABLES;

-- Get descriptions of all tables
SELECT CONCAT('DESC ', table_name, ';') AS query
FROM information_schema.tables 
WHERE table_schema = 'beyou';

-- Additional table details
SELECT 
    table_name,
    column_name,
    column_type,
    is_nullable,
    column_default,
    column_key,
    extra
FROM information_schema.columns
WHERE table_schema = 'beyou'
ORDER BY table_name, ordinal_position;
