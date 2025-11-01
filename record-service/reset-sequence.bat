@echo off
echo Resetting PostgreSQL sequence for records table...
docker exec -it record-postgres psql -U postgres -d record-service -c "SELECT setval(pg_get_serial_sequence('records', 'id'), COALESCE((SELECT MAX(id) FROM records), 0) + 1, false);"
echo Done!
pause
