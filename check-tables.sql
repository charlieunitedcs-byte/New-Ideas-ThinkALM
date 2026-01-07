-- Check what tables exist in your database
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check row counts for our tables
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'calls', COUNT(*) FROM calls
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'campaigns', COUNT(*) FROM campaigns;
