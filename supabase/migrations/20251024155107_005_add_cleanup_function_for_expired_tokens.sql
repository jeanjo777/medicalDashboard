/*
  # Add automatic cleanup for expired tokens

  1. New Functions
    - `cleanup_expired_tokens()` - Removes expired and used password reset tokens
    - Automatically deletes tokens older than their expiration date
    - Deletes used tokens older than 24 hours

  2. Security
    - Ensures tokens are not kept indefinitely in the database
    - Complies with RGPD data retention policies
    - Reduces database bloat

  3. Notes
    - This function can be called manually or via a scheduled job
    - Returns the number of deleted tokens
    - Should be run periodically (e.g., daily via cron job)
*/

CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM password_reset_tokens
    WHERE 
      (expires_at < NOW())
      OR 
      (used = true AND created_at < NOW() - INTERVAL '24 hours')
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_old_reset_attempts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM password_reset_attempts
    WHERE created_at < NOW() - INTERVAL '30 days'
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM login_attempts
    WHERE created_at < NOW() - INTERVAL '30 days'
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$;