
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the send-scheduled-emails function every 30 minutes
SELECT cron.schedule(
  'send-scheduled-emails-every-30-minutes',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT
    net.http_post(
        url:='https://ejsffrbrqgvbxzgmrlcg.supabase.co/functions/v1/send-scheduled-emails',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqc2ZmcmJycWd2Ynh6Z21ybGNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4OTEwOTIsImV4cCI6MjA2NTQ2NzA5Mn0.Pjy6PumViQTDF-6Zo1Z9upSqBweCxoN_faeBK2w1WV0"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
