-- RPC function to delete a consultation and its messages
-- Uses SECURITY DEFINER to bypass RLS policies
CREATE OR REPLACE FUNCTION delete_consultation(consultation_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM consultation_messages WHERE consultation_id = consultation_id_param;
  DELETE FROM consultations WHERE id = consultation_id_param;
END;
$$;
