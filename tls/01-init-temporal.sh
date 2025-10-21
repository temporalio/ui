#!/bin/bash
# postgres-init/01-init-temporal.sh
# Creates the temporal and temporal_visibility databases

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create temporal_visibility database
    CREATE DATABASE temporal_visibility;
    GRANT ALL PRIVILEGES ON DATABASE temporal_visibility TO temporal;
EOSQL

echo "Temporal databases initialized successfully"
