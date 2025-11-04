-- Ensure notifications_type enum includes all values used by notification triggers/functions
-- Add missing values safely
ALTER TYPE public.notifications_type ADD VALUE IF NOT EXISTS 'campaign_approval';
ALTER TYPE public.notifications_type ADD VALUE IF NOT EXISTS 'donation';
ALTER TYPE public.notifications_type ADD VALUE IF NOT EXISTS 'report';
ALTER TYPE public.notifications_type ADD VALUE IF NOT EXISTS 'milestone';