import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Flag, 
  AlertTriangle, 
  Clock,
  DollarSign,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  title: string;
  creator: string;
  goal: number;
  raised: number;
  status: "pending" | "approved" | "rejected" | "flagged";
  category: string;
  createdAt: string;
  flagged: boolean;
  riskScore: number;
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Emergency Surgery for Sarah - Critical Heart Operation",
    creator: "John Smith",
    goal: 500000,
    raised: 325000,
    status: "pending",
    category: "Medical",
    createdAt: "2024-01-15",
    flagged: false,
    riskScore: 2.1
  },
  {
    id: "2",
    title: "Help Build School Library in Rural Kenya",
    creator: "Mary Johnson",
    goal: 250000,
    raised: 187500,
    status: "approved",
    category: "Education",
    createdAt: "2024-01-14",
    flagged: false,
    riskScore: 1.2
  },
  {
    id: "3",
    title: "Save the Stray Dogs - Animal Rescue Operation",
    creator: "Pet Rescue Inc",
    goal: 150000,
    raised: 85000,
    status: "flagged",
    category: "Animals",
    createdAt: "2024-01-13",
    flagged: true,
    riskScore: 7.8
  },
  {
    id: "4",
    title: "Urgent: Family Lost Everything in Fire",
    creator: "Anonymous Helper",
    goal: 300000,
    raised: 45000,
    status: "pending",
    category: "Emergency",
    createdAt: "2024-01-12",
    flagged: true,
    riskScore: 8.5
  }
];

export function CampaignModerationTable() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const { toast } = useToast();

  const handleAction = (campaignId: string, action: "approve" | "reject" | "flag") => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === campaignId 
        ? { 
            ...campaign, 
            status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "flagged",
            flagged: action === "flag"
          }
        : campaign
    ));

    const actionText = action === "approve" ? "approved" : action === "reject" ? "rejected" : "flagged";
    toast({
      title: `Campaign ${actionText}`,
      description: `The campaign has been ${actionText} successfully.`,
      variant: action === "reject" ? "destructive" : "default",
    });
  };

  const getStatusBadge = (status: string, flagged: boolean) => {
    if (flagged) {
      return <Badge variant="destructive" className="gap-1"><Flag className="h-3 w-3" />Flagged</Badge>;
    }
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-success gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (score: number) => {
    if (score > 7) return <Badge variant="destructive">High Risk</Badge>;
    if (score > 4) return <Badge variant="secondary" className="bg-warning/20 text-warning">Medium Risk</Badge>;
    return <Badge variant="outline" className="text-success">Low Risk</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Campaign Moderation Queue
        </CardTitle>
        <CardDescription>
          Review and moderate campaigns awaiting approval. {campaigns.filter(c => c.status === "pending").length} pending campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Goal/Raised</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id} className={campaign.flagged ? "bg-destructive/5" : ""}>
                <TableCell>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {campaign.title}
                      {campaign.flagged && <Flag className="h-4 w-4 text-destructive" />}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {campaign.category} • {campaign.createdAt}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {campaign.creator}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      KES {campaign.raised.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">
                      of KES {campaign.goal.toLocaleString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getRiskBadge(campaign.riskScore)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(campaign.status, campaign.flagged)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Campaign</DialogTitle>
                          <DialogDescription>
                            Detailed review of "{selectedCampaign?.title}"
                          </DialogDescription>
                        </DialogHeader>
                        {selectedCampaign && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Creator</Label>
                                <p className="text-sm">{selectedCampaign.creator}</p>
                              </div>
                              <div>
                                <Label>Risk Score</Label>
                                <p className="text-sm">{selectedCampaign.riskScore}/10</p>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Campaign Details</Label>
                              <div className="bg-muted p-3 rounded-lg text-sm">
                                Goal: KES {selectedCampaign.goal.toLocaleString()}<br/>
                                Raised: KES {selectedCampaign.raised.toLocaleString()}<br/>
                                Category: {selectedCampaign.category}<br/>
                                Created: {selectedCampaign.createdAt}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="reviewNote">Review Notes</Label>
                              <Textarea
                                id="reviewNote"
                                placeholder="Add review notes..."
                                value={reviewNote}
                                onChange={(e) => setReviewNote(e.target.value)}
                              />
                            </div>

                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => handleAction(selectedCampaign.id, "flag")}
                              >
                                <Flag className="h-4 w-4 mr-1" />
                                Flag
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleAction(selectedCampaign.id, "reject")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleAction(selectedCampaign.id, "approve")}
                                className="bg-success hover:bg-success/90"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}