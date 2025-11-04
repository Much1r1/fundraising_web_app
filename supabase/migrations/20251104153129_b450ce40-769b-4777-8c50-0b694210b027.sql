-- Function to get all admin user IDs
CREATE OR REPLACE FUNCTION get_admin_user_ids()
RETURNS TABLE(user_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_roles.user_id
  FROM user_roles
  WHERE role = 'admin'::app_role;
$$;

-- Function to notify admins of new donations
CREATE OR REPLACE FUNCTION notify_admins_new_donation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id uuid;
  campaign_title text;
  donor_name text;
BEGIN
  -- Get campaign title
  SELECT title INTO campaign_title
  FROM campaigns
  WHERE id = NEW.campaign_id;
  
  -- Get donor name (if not anonymous)
  IF NEW.is_anonymous = false AND NEW.donor_id IS NOT NULL THEN
    SELECT full_name INTO donor_name
    FROM users
    WHERE id = NEW.donor_id;
  ELSE
    donor_name := 'Anonymous';
  END IF;
  
  -- Create notification for each admin
  FOR admin_id IN SELECT user_id FROM get_admin_user_ids()
  LOOP
    INSERT INTO notifications (user_id, campaign_id, type, title, message, metadata)
    VALUES (
      admin_id,
      NEW.campaign_id,
      'donation',
      'New Donation Received',
      format('%s donated %s KES to "%s"', donor_name, NEW.amount, campaign_title),
      jsonb_build_object('amount', NEW.amount, 'donor_name', donor_name)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Function to notify admins of campaigns pending approval
CREATE OR REPLACE FUNCTION notify_admins_campaign_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id uuid;
  creator_name text;
BEGIN
  -- Only notify when approval_status changes to 'pending'
  IF NEW.approval_status = 'pending' AND (OLD.approval_status IS DISTINCT FROM 'pending') THEN
    -- Get creator name
    SELECT full_name INTO creator_name
    FROM users
    WHERE id = NEW.user_id;
    
    -- Create notification for each admin
    FOR admin_id IN SELECT user_id FROM get_admin_user_ids()
    LOOP
      INSERT INTO notifications (user_id, campaign_id, type, title, message, metadata)
      VALUES (
        admin_id,
        NEW.id,
        'campaign_approval',
        'Campaign Awaiting Approval',
        format('"%s" by %s needs approval', NEW.title, creator_name),
        jsonb_build_object('creator_name', creator_name, 'category', NEW.category)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify admins of new reports
CREATE OR REPLACE FUNCTION notify_admins_new_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id uuid;
  reporter_name text;
  report_target text;
BEGIN
  -- Get reporter name
  SELECT full_name INTO reporter_name
  FROM users
  WHERE id = NEW.reporter_id;
  
  -- Determine what was reported
  IF NEW.campaign_id IS NOT NULL THEN
    report_target := 'campaign';
  ELSE
    report_target := 'comment';
  END IF;
  
  -- Create notification for each admin
  FOR admin_id IN SELECT user_id FROM get_admin_user_ids()
  LOOP
    INSERT INTO notifications (user_id, campaign_id, type, title, message, metadata)
    VALUES (
      admin_id,
      NEW.campaign_id,
      'report',
      'New Report Submitted',
      format('%s reported a %s: %s', reporter_name, report_target, NEW.details),
      jsonb_build_object('reporter_name', reporter_name, 'reason', NEW.reason, 'report_target', report_target)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Function to notify admins of campaign milestones
CREATE OR REPLACE FUNCTION notify_admins_campaign_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id uuid;
  old_percentage numeric;
  new_percentage numeric;
  milestone_reached numeric;
BEGIN
  -- Calculate percentages
  IF NEW.goal_amount > 0 THEN
    old_percentage := (COALESCE(OLD.current_amount, 0) / NEW.goal_amount) * 100;
    new_percentage := (NEW.current_amount / NEW.goal_amount) * 100;
    
    -- Check for milestone crossings (50%, 75%, 100%)
    IF old_percentage < 50 AND new_percentage >= 50 THEN
      milestone_reached := 50;
    ELSIF old_percentage < 75 AND new_percentage >= 75 THEN
      milestone_reached := 75;
    ELSIF old_percentage < 100 AND new_percentage >= 100 THEN
      milestone_reached := 100;
    ELSE
      RETURN NEW;
    END IF;
    
    -- Create notification for each admin
    FOR admin_id IN SELECT user_id FROM get_admin_user_ids()
    LOOP
      INSERT INTO notifications (user_id, campaign_id, type, title, message, metadata)
      VALUES (
        admin_id,
        NEW.id,
        'milestone',
        'Campaign Milestone Reached',
        format('"%s" reached %s%% of its goal!', NEW.title, milestone_reached),
        jsonb_build_object('milestone', milestone_reached, 'current_amount', NEW.current_amount, 'goal_amount', NEW.goal_amount)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_admins_new_donation ON donations;
CREATE TRIGGER trigger_notify_admins_new_donation
AFTER INSERT ON donations
FOR EACH ROW
EXECUTE FUNCTION notify_admins_new_donation();

DROP TRIGGER IF EXISTS trigger_notify_admins_campaign_approval ON campaigns;
CREATE TRIGGER trigger_notify_admins_campaign_approval
AFTER INSERT OR UPDATE OF approval_status ON campaigns
FOR EACH ROW
EXECUTE FUNCTION notify_admins_campaign_approval();

DROP TRIGGER IF EXISTS trigger_notify_admins_new_report ON "reports/flags";
CREATE TRIGGER trigger_notify_admins_new_report
AFTER INSERT ON "reports/flags"
FOR EACH ROW
EXECUTE FUNCTION notify_admins_new_report();

DROP TRIGGER IF EXISTS trigger_notify_admins_campaign_milestone ON campaigns;
CREATE TRIGGER trigger_notify_admins_campaign_milestone
AFTER UPDATE OF current_amount ON campaigns
FOR EACH ROW
EXECUTE FUNCTION notify_admins_campaign_milestone();