import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  ExternalLink,
  Star,
  Search,
  ArrowUpDown,
  Filter
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
  approval_status: string;
  is_featured: boolean;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type SortField = 'created_at' | 'goal_amount' | 'current_amount';
type SortOrder = 'asc' | 'desc';

export const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [detailCampaign, setDetailCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    fetchCampaigns();

    // Real-time subscription for campaign changes
    const channel = supabase
      .channel('campaign-management-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'campaigns' }, 
        () => {
          fetchCampaigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter and sort campaigns
  useEffect(() => {
    let result = [...campaigns];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(c => c.approval_status === statusFilter);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.users?.email?.toLowerCase().includes(query) ||
        c.users?.full_name?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      
      if (sortField === 'created_at') {
        return multiplier * (new Date(aValue).getTime() - new Date(bValue).getTime());
      }
      return multiplier * (Number(aValue) - Number(bValue));
    });

    setFilteredCampaigns(result);
  }, [campaigns, statusFilter, searchQuery, sortField, sortOrder]);

  const fetchCampaigns = async () => {
    try {
      // First fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      // Then fetch user details for each campaign
      const campaignsWithUsers = await Promise.all(
        (campaignsData || []).map(async (campaign) => {
          const { data: userData } = await supabase
            .from("users")
            .select("full_name, email")
            .eq("id", campaign.user_id)
            .single();

          return {
            ...campaign,
            users: userData || { full_name: "Unknown", email: "N/A" },
          };
        })
      );

      setCampaigns(campaignsWithUsers as any);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
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

      fetchCampaigns();
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
      fetchCampaigns();
    } catch (error) {
      console.error("Error rejecting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to reject campaign",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (campaignId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ is_featured: !currentValue })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: !currentValue ? "Campaign Featured" : "Campaign Unfeatured",
        description: !currentValue 
          ? "This campaign will appear at the top of the homepage." 
          : "This campaign has been removed from featured campaigns.",
      });

      fetchCampaigns();
    } catch (error) {
      console.error("Error toggling featured status:", error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = campaigns.filter(c => c.approval_status === 'pending').length;
  const approvedCount = campaigns.filter(c => c.approval_status === 'approved').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              Campaign Management
              <Badge variant="secondary">{campaigns.length} Total</Badge>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                {pendingCount} Pending
              </Badge>
              <Badge variant="outline" className="bg-success/10 text-success border-success">
                {approvedCount} Approved
              </Badge>
            </CardTitle>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, creator name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-');
            setSortField(field as SortField);
            setSortOrder(order as SortOrder);
          }}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Newest First</SelectItem>
              <SelectItem value="created_at-asc">Oldest First</SelectItem>
              <SelectItem value="goal_amount-desc">Highest Goal</SelectItem>
              <SelectItem value="goal_amount-asc">Lowest Goal</SelectItem>
              <SelectItem value="current_amount-desc">Most Raised</SelectItem>
              <SelectItem value="current_amount-asc">Least Raised</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No campaigns found</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Raised</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {campaign.image_url && (
                          <img
                            src={campaign.image_url}
                            alt={campaign.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium line-clamp-1">{campaign.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {campaign.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{campaign.users?.full_name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{campaign.users?.email || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">KSh {campaign.goal_amount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">KSh {campaign.current_amount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((campaign.current_amount / campaign.goal_amount) * 100)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{format(new Date(campaign.created_at), "MMM d, yyyy")}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.approval_status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={campaign.is_featured}
                          onCheckedChange={() => handleToggleFeatured(campaign.id, campaign.is_featured)}
                        />
                        {campaign.is_featured && <Star className="w-4 h-4 text-warning fill-warning" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setDetailCampaign(campaign)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>{campaign.title}</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-6 mt-6">
                              {campaign.image_url && (
                                <img
                                  src={campaign.image_url}
                                  alt={campaign.title}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                              )}
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-muted-foreground">Creator</div>
                                  <div className="font-medium">{campaign.users?.full_name}</div>
                                  <div className="text-sm text-muted-foreground">{campaign.users?.email}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Status</div>
                                  <div className="mt-1">{getStatusBadge(campaign.approval_status)}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Goal Amount</div>
                                  <div className="font-medium">KSh {campaign.goal_amount.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Raised Amount</div>
                                  <div className="font-medium">KSh {campaign.current_amount.toLocaleString()}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Category</div>
                                  <div className="font-medium">{campaign.category}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Created Date</div>
                                  <div className="font-medium">
                                    {format(new Date(campaign.created_at), "PPP")}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">{campaign.description}</p>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">Campaign Story</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{campaign.story}</p>
                              </div>

                              {campaign.approval_status === 'pending' && (
                                <div className="flex gap-2 pt-4 border-t">
                                  <Button
                                    className="flex-1 bg-success hover:bg-success/90"
                                    onClick={() => handleApprove(campaign.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Campaign
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
                                        className="flex-1"
                                        onClick={() => setSelectedCampaign(campaign.id)}
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Campaign
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
                              )}

                              {campaign.rejection_reason && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                  <div className="font-semibold text-destructive mb-1">Rejection Reason:</div>
                                  <p className="text-sm text-muted-foreground">{campaign.rejection_reason}</p>
                                </div>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>

                        {campaign.approval_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-success hover:bg-success/90"
                              onClick={() => handleApprove(campaign.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
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
                                  <XCircle className="w-4 h-4" />
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
