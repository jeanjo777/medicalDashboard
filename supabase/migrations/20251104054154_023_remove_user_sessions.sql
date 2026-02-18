/*
  # Remove user sessions system

  1. Changes
    - Drop user_sessions table if exists
    - Remove any related policies
    
  2. Security
    - Clean removal with IF EXISTS checks
*/

-- Drop table if exists
DROP TABLE IF EXISTS user_sessions CASCADE;
