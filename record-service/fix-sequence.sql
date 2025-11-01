-- Fix PostgreSQL sequence for records table
-- This resets the sequence to the maximum ID + 1

-- Option 1: If you want to keep existing data
SELECT setval(pg_get_serial_sequence('records', 'id'), COALESCE((SELECT MAX(id) FROM records), 0) + 1, false);

-- Option 2: If you want to clear all records and reset
-- TRUNCATE TABLE records RESTART IDENTITY CASCADE;
