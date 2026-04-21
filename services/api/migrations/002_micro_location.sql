-- Migration 002: Micro-location tracking for GPS-based recommendations

-- Add micro-location columns to location_logs
ALTER TABLE location_logs
    ADD COLUMN IF NOT EXISTS latitude  NUMERIC(9,6),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6),
    ADD COLUMN IF NOT EXISTS lat_bucket NUMERIC(6,3),   -- rounded to 0.002 deg ≈ 200 m
    ADD COLUMN IF NOT EXISTS lng_bucket NUMERIC(6,3),
    ADD COLUMN IF NOT EXISTS geohash   VARCHAR(16);     -- "lat_bucket:lng_bucket" composite key

CREATE INDEX IF NOT EXISTS idx_location_logs_geohash ON location_logs(user_id, geohash);
CREATE INDEX IF NOT EXISTS idx_location_logs_bucket  ON location_logs(lat_bucket, lng_bucket);

-- Add geohash to listening_history so we can query "what did the user listen to at this spot?"
ALTER TABLE listening_history
    ADD COLUMN IF NOT EXISTS geohash VARCHAR(16);

CREATE INDEX IF NOT EXISTS idx_listening_history_geohash ON listening_history(user_id, geohash);
