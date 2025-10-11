import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Calendar,
  Shield,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CampaignDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Campaign not found</h2>
          <Link to="/campaigns">
            <Button>Browse Campaigns</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = (Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100;
  const daysLeft = campaign.end_date
    ? Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Campaign link copied to clipboard",
    });
  };

  const handleDonate = () => {
    if (!donationAmount || Number(donationAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Processing donation",
      description: `Processing donation of $${donationAmount}`,
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Back Button */}
        <Link to="/campaigns">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
              {campaign.image_url ? (
                <img
                  src={campaign.image_url}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full gradient-primary flex items-center justify-center">
                  <Heart className="w-24 h-24 text-primary-foreground/30" />
                </div>
              )}
              
              {campaign.verification_status === "verified" && (
                <Badge className="absolute top-4 right-4 bg-success gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Campaign Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">{campaign.category}</Badge>
                      {campaign.location && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {campaign.location}
                        </span>
                      )}
                    </div>
                    <h1 className="mb-2">{campaign.title}</h1>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {campaign.description}
                  </p>
                </div>

                <Separator className="my-6" />

                {/* Campaign Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Supporters</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{Math.round(progress)}%</p>
                    <p className="text-sm text-muted-foreground">Funded</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{daysLeft || "—"}</p>
                    <p className="text-sm text-muted-foreground">Days Left</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-secondary/50">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">
                      {new Date(campaign.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-muted-foreground">Started</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Campaign Organizer</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {campaign.title.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Campaign Creator</p>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(campaign.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-xl">
              <CardContent className="p-6 space-y-6">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="relative">
                    <Progress value={progress} className="h-3" />
                    <div className="absolute inset-0 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      ${Number(campaign.current_amount).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      raised of ${Number(campaign.goal_amount).toLocaleString()} goal
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Donation Amount */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Enter your donation</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="pl-8 text-lg"
                    />
                  </div>

                  {/* Quick amounts */}
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 25, 50].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDonationAmount(amount.toString())}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Donate Button */}
                <Button className="w-full" size="lg" variant="hero" onClick={handleDonate}>
                  Donate Now
                </Button>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-current text-red-500" : ""}`} />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>

                <Separator />

                {/* Trust Indicators */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Protected by secure payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    <span>Donations are tax-deductible</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
