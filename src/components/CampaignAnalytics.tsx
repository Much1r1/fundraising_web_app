import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Share2, Users, TrendingUp, DollarSign } from "lucide-react";
import { useCampaignAnalytics } from "@/hooks/use-campaign-analytics";

interface CampaignAnalyticsProps {
  campaignId: string;
}

export const CampaignAnalytics = ({ campaignId }: CampaignAnalyticsProps) => {
  const { getAnalytics } = useCampaignAnalytics();

  // Fetch analytics data
  const { data: analytics } = useQuery({
    queryKey: ["campaign-analytics", campaignId],
    queryFn: () => getAnalytics(campaignId),
  });

  // Fetch donor demographics
  const { data: donorDemographics } = useQuery({
    queryKey: ["donor-demographics", campaignId],
    queryFn: async () => {
      const { data: donations, error } = await supabase
        .from("donations")
        .select(`
          amount,
          donor_id,
          created_at,
          donor:users!donations_donor_id_fkey(full_name)
        `)
        .eq("campaign_id", campaignId)
        .eq("payment_status", "completed");

      if (error) throw error;

      const uniqueDonors = new Set(donations?.map((d) => d.donor_id).filter(Boolean));
      const totalDonations = donations?.length || 0;
      const avgDonation = donations?.length
        ? donations.reduce((sum, d) => sum + Number(d.amount), 0) / donations.length
        : 0;

      // Calculate repeat donors
      const donorCounts = donations?.reduce((acc, d) => {
        if (d.donor_id) {
          acc[d.donor_id] = (acc[d.donor_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const repeatDonors = Object.values(donorCounts || {}).filter((count) => count > 1).length;

      return {
        uniqueDonors: uniqueDonors.size,
        totalDonations,
        avgDonation: avgDonation.toFixed(2),
        repeatDonors,
      };
    },
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Campaign Analytics</h3>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.views || 0}</div>
            <p className="text-xs text-muted-foreground">Campaign page visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.shares || 0}</div>
            <p className="text-xs text-muted-foreground">Social media shares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donorDemographics?.uniqueDonors || 0}</div>
            <p className="text-xs text-muted-foreground">Individual supporters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donorDemographics?.totalDonations || 0}</div>
            <p className="text-xs text-muted-foreground">All contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Donation</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {donorDemographics?.avgDonation || 0}</div>
            <p className="text-xs text-muted-foreground">Per contribution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donorDemographics?.repeatDonors || 0}</div>
            <p className="text-xs text-muted-foreground">Donated multiple times</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
