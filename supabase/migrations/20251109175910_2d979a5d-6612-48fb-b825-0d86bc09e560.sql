-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the reminder processing function to run every hour
SELECT cron.schedule(
  'process-donation-reminders',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://tsfrkycayhymzmqamnsu.supabase.co/functions/v1/process-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZnJreWNheWh5bXptcWFtbnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Nzc0OTYsImV4cCI6MjA3MzM1MzQ5Nn0.O9RmZiilRAJqvJC1Hl6Bb2UMpWWsIAbqQ60Qr1u-L0o"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);