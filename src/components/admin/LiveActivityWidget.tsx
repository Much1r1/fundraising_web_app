import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Heart, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { parseUTCDate } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "donation" | "campaign_update";
  title: string;
  subtitle: string;
  amount?: number;
  timestamp: Date;
}

export const LiveActivityWidget = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Fetch initial recent activities
    const fetchRecentActivities = async () => {
      try {
        // Fetch recent donations
        const { data: donations } = await supabase
          .from("donations")
          .select(`
            id,
            amount,
            created_at,
            campaigns(title)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch recent campaign updates
        const { data: campaigns } = await supabase
          .from("campaigns")
          .select("id, title, updated_at, approval_status")
          .order("updated_at", { ascending: false })
          .limit(5);

        const recentActivities: ActivityItem[] = [];

        donations?.forEach((donation: any) => {
          recentActivities.push({
            id: donation.id,
            type: "donation",
            title: `New donation received`,
            subtitle: donation.campaigns?.title || "Unknown campaign",
            amount: Number(donation.amount),
            timestamp: parseUTCDate(donation.created_at),
          });
        });

        campaigns?.forEach((campaign: any) => {
          recentActivities.push({
            id: campaign.id,
            type: "campaign_update",
            title: `Campaign ${campaign.approval_status}`,
            subtitle: campaign.title,
            timestamp: parseUTCDate(campaign.updated_at),
          });
        });

        // Sort by timestamp
        recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(recentActivities.slice(0, 10));
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };

    fetchRecentActivities();

    // Set up real-time subscriptions
    const donationsChannel = supabase
      .channel("donations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "donations",
        },
        async (payload) => {
          console.log("New donation received:", payload);
          
          // Fetch campaign details
          const { data: campaign } = await supabase
            .from("campaigns")
            .select("title")
            .eq("id", payload.new.campaign_id)
            .single();

          const newActivity: ActivityItem = {
            id: payload.new.id,
            type: "donation",
            title: "New donation received",
            subtitle: campaign?.title || "Unknown campaign",
            amount: Number(payload.new.amount),
            timestamp: parseUTCDate(payload.new.created_at),
          };

          setActivities((prev) => [newActivity, ...prev].slice(0, 10));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        }
      });

    const campaignsChannel = supabase
      .channel("campaigns-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "campaigns",
        },
        (payload) => {
          console.log("Campaign updated:", payload);
          
          const newActivity: ActivityItem = {
            id: payload.new.id,
            type: "campaign_update",
            title: `Campaign ${payload.new.approval_status}`,
            subtitle: payload.new.title,
            timestamp: parseUTCDate(payload.new.updated_at),
          };

          setActivities((prev) => [newActivity, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(donationsChannel);
      supabase.removeChannel(campaignsChannel);
    };
  }, []);

  return (
    <Card className="border-2 hover:border-primary/50 transition-smooth">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Live Activity
        </CardTitle>
        <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
          {isConnected ? "Live" : "Connecting..."}
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Waiting for activity...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-smooth animate-in slide-in-from-top-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === "donation" 
                      ? "bg-success/20 text-success" 
                      : "bg-primary/20 text-primary"
                  }`}>
                    {activity.type === "donation" ? (
                      <DollarSign className="w-5 h-5" />
                    ) : (
                      <Heart className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.subtitle}
                        </p>
                      </div>
                      {activity.amount && (
                        <Badge variant="secondary" className="flex-shrink-0">
                          KSh {activity.amount.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
