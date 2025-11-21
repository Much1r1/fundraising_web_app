import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Donation = {
  id: string;
  amount: number;
  created_at: string;
  is_anonymous: boolean;
  campaign_id: string;
  donor_id?: string;
  donor_name?: string;
  donor_avatar?: string;
  campaign_title?: string;
};

const GlobalActivityFeed = () => {
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  // Fetch initial donations
  const { data: initialDonations } = useQuery({
    queryKey: ["global-donations"],
    queryFn: async () => {
      const { data: donations, error } = await supabase
        .from("donations")
        .select("id, amount, created_at, is_anonymous, campaign_id, donor_id")
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch related data
      const donationsWithData = await Promise.all(
        (donations || []).map(async (donation) => {
          let donor_name = "Anonymous";
          let donor_avatar = null;
          let campaign_title = "Campaign";

          // Fetch donor info if not anonymous
          if (!donation.is_anonymous && donation.donor_id) {
            const { data: userData } = await supabase
              .from("users")
              .select("full_name, avatar_url")
              .eq("id", donation.donor_id)
              .maybeSingle();
            
            if (userData) {
              donor_name = userData.full_name;
              donor_avatar = userData.avatar_url;
            }
          }

          // Fetch campaign info
          const { data: campaignData } = await supabase
            .from("campaigns")
            .select("title")
            .eq("id", donation.campaign_id)
            .maybeSingle();

          if (campaignData) {
            campaign_title = campaignData.title;
          }

          return {
            ...donation,
            donor_name,
            donor_avatar,
            campaign_title,
          };
        })
      );

      return donationsWithData as Donation[];
    },
  });

  // Set initial donations when data loads
  useEffect(() => {
    if (initialDonations) {
      setRecentDonations(initialDonations);
    }
  }, [initialDonations]);

  // Subscribe to real-time donation updates
  useEffect(() => {
    const channel = supabase
      .channel("global_donations_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "donations",
        },
        async (payload) => {
          const newDonation = payload.new as any;
          
          let donor_name = "Anonymous";
          let donor_avatar = null;
          let campaign_title = "Campaign";

          // Fetch donor info if not anonymous
          if (!newDonation.is_anonymous && newDonation.donor_id) {
            const { data: userData } = await supabase
              .from("users")
              .select("full_name, avatar_url")
              .eq("id", newDonation.donor_id)
              .maybeSingle();
            
            if (userData) {
              donor_name = userData.full_name;
              donor_avatar = userData.avatar_url;
            }
          }

          // Fetch campaign info
          const { data: campaignData } = await supabase
            .from("campaigns")
            .select("title")
            .eq("id", newDonation.campaign_id)
            .maybeSingle();

          if (campaignData) {
            campaign_title = campaignData.title;
          }

          const enrichedDonation: Donation = {
            id: newDonation.id,
            amount: newDonation.amount,
            created_at: newDonation.created_at,
            is_anonymous: newDonation.is_anonymous,
            campaign_id: newDonation.campaign_id,
            donor_id: newDonation.donor_id,
            donor_name,
            donor_avatar,
            campaign_title,
          };

          setRecentDonations((prev) => [enrichedDonation, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!recentDonations.length) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {recentDonations.map((donation, index) => {
            const donorName = donation.is_anonymous
              ? "Anonymous Donor"
              : donation.donor_name || "Anonymous";
            const campaignTitle = donation.campaign_title || "Campaign";

            return (
              <div
                key={donation.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={donation.donor_avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {donation.is_anonymous ? "?" : donorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-primary fill-primary" />
                    <p className="font-semibold text-sm truncate">{donorName}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    donated{" "}
                    <span className="font-bold text-primary">
                      KSh {Number(donation.amount).toLocaleString()}
                    </span>{" "}
                    to <span className="font-medium">{campaignTitle}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalActivityFeed;
