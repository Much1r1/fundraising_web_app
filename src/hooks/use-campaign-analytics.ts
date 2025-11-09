import { supabase } from "@/integrations/supabase/client";

export const useCampaignAnalytics = () => {
  const trackEvent = async (
    campaignId: string,
    eventType: "view" | "share",
    metadata?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Generate a session ID if user is not logged in
      let sessionId = sessionStorage.getItem("analytics_session");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("analytics_session", sessionId);
      }

      await supabase.from("campaign_analytics").insert({
        campaign_id: campaignId,
        event_type: eventType,
        user_id: user?.id || null,
        session_id: sessionId,
        metadata: metadata || {},
      });
    } catch (error) {
      console.error("Failed to track analytics:", error);
    }
  };

  const getAnalytics = async (campaignId: string) => {
    const { data, error } = await supabase
      .from("campaign_analytics")
      .select("*")
      .eq("campaign_id", campaignId);

    if (error) throw error;

    const views = data?.filter((e) => e.event_type === "view").length || 0;
    const shares = data?.filter((e) => e.event_type === "share").length || 0;

    return { views, shares };
  };

  return { trackEvent, getAnalytics };
};
