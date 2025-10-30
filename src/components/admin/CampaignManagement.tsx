import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  ExternalLink 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  category: string;
  created_at: string;
  user_id: string;
  users: {
    full_name: string;
    email: string;
  } | null;
  image_url?: string | null;
  story: string;
}

export const CampaignManagement = () => {
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingCampaigns();

    // Real-time subscription for campaign changes
    const channel = supabase
      .channel('campaign-approval-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'campaigns' }, 
        () => {
          fetchPendingCampaigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          *,
          users:user_id (
            full_name,
            email
          )
        `)
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingCampaigns((data || []) as any);
    } catch (error) {
      console.error("Error fetching pending campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load pending campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("campaigns")
        .update({
          approval_status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          campaign_status: "active",
          visibility: "public",
        })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaign Approved",
        description: "The campaign is now live and visible to everyone.",
      });

      fetchPendingCampaigns();
    } catch (error) {
      console.error("Error approving campaign:", error);
      toast({
        title: "Error",
        description: "Failed to approve campaign",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("campaigns")
        .update({
          approval_status: "rejected",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason || "Did not meet community guidelines",
        })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaign Rejected",
        description: "The campaign creator will be notified.",
      });

      setSelectedCampaign(null);
      setRejectionReason("");
      fetchPendingCampaigns();
    } catch (error) {
      console.error("Error rejecting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to reject campaign",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Pending Campaign Reviews
          <Badge variant="secondary">{pendingCampaigns.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingCampaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No campaigns pending review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border rounded-lg p-4 hover:border-primary/50 transition-smooth"
              >
                <div className="flex gap-4">
                  {campaign.image_url && (
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {campaign.users?.full_name || 'Unknown'} ({campaign.users?.email || 'N/A'})
                        </p>
                      </div>
                      <Badge>{campaign.category}</Badge>
                    </div>
                    
                    <p className="text-sm line-clamp-2">{campaign.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Goal: KSh {campaign.goal_amount.toLocaleString()}</span>
                      <span>•</span>
                      <span>Created: {format(new Date(campaign.created_at), "MMM d, yyyy")}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{campaign.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {campaign.image_url && (
                              <img
                                src={campaign.image_url}
                                alt={campaign.title}
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <h4 className="font-semibold mb-2">Campaign Story</h4>
                              <p className="text-sm whitespace-pre-wrap">{campaign.story}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/campaigns/${campaign.id}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Page
                      </Button>

                      <div className="flex-1" />

                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(campaign.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>

                      <Dialog
                        open={selectedCampaign === campaign.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setSelectedCampaign(null);
                            setRejectionReason("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign.id)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Campaign</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Please provide a reason for rejecting this campaign. The creator will see this message.
                            </p>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="e.g., Does not meet community guidelines, insufficient information, etc."
                              rows={4}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedCampaign(null);
                                  setRejectionReason("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(campaign.id)}
                                disabled={!rejectionReason}
                              >
                                Confirm Rejection
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
