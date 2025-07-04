
-- Enable real-time updates for appointments table
ALTER TABLE appointments REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
