import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Facebook, Twitter, Instagram, MessageCircle } from "lucide-react";
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
import { CommentSection } from "@/components/CommentSection";
import ShareCampaignModal from "@/components/ShareCampaignModal";

const CampaignDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "stripe">("mpesa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

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
    setShareOpen(true);
  };

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "mpesa") {
      if (!phoneNumber || !/^254\d{9}$/.test(phoneNumber)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number (format: 254XXXXXXXXX)",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('mpesa-payment', {
          body: {
            action: 'initiate',
            phoneNumber,
            amount: parseFloat(donationAmount),
            campaignId: id,
            donorId: null,
            accountReference: campaign?.title.substring(0, 12),
          },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "STK Push Sent",
            description: data.message,
          });
          setDonationAmount("");
          setPhoneNumber("");
        } else {
          throw new Error(data.error || 'Payment initiation failed');
        }
      } catch (error: any) {
        console.error('M-Pesa payment error:', error);
        toast({
          title: "Payment Failed",
          description: error.message || "Failed to initiate M-Pesa payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      toast({
        title: "Coming Soon",
        description: "Stripe payment integration coming soon!",
      });
    }
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
                      KSh {Number(campaign.current_amount).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      raised of KSh {Number(campaign.goal_amount).toLocaleString()} goal
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={paymentMethod === "mpesa" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("mpesa")}
                      size="sm"
                    >
                      M-Pesa
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "stripe" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("stripe")}
                      size="sm"
                    >
                      Card/PayPal
                    </Button>
                  </div>
                </div>

                {/* Phone Number for M-Pesa */}
                {paymentMethod === "mpesa" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="254XXXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your M-Pesa number
                    </p>
                  </div>
                )}

                {/* Donation Amount */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Enter your donation</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      KSh
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
                    {[100, 500, 1000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setDonationAmount(amount.toString())}
                      >
                        KSh {amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Donate Button */}
                <Button 
                  className="w-full" 
                  size="lg" 
                  variant="hero" 
                  onClick={handleDonate}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Donate Now"}
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
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowShareModal(true)}>
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

        {/* Comments Section */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <CommentSection campaignId={id!} />
        </div>
      </div>

      {/* Added Share Modal */}
      <ShareCampaignModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        campaign={{
          title: campaign.title,
          description: campaign.description,
          link: window.location.href,
          category: campaign.category,
        }}
      />

<Dialog open={showShareModal} onOpenChange={setShowShareModal}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Share this campaign</DialogTitle>
    </DialogHeader>

    {/* Tailored message generator */}
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose a platform to share this campaign with your friends and supporters.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {(() => {
          const baseMessage = (() => {
            switch (campaign.category?.toLowerCase()) {
              case "education":
                return `Support this education campaign: ${campaign.title}`;
              case "medical":
                return `Help fund a medical cause: ${campaign.title}`;
              case "charity":
                return `Join in supporting this charity drive: ${campaign.title}`;
              case "community":
                return `Empower a community through this campaign: ${campaign.title}`;
              case "environment":
                return `Protect our planet, support this environmental cause: ${campaign.title}`;
              case "faith":
                return `Stand in faith and give toward this mission: ${campaign.title}`;
              case "justice":
                return `Stand for justice, support this movement: ${campaign.title}`;
              case "creative":
                return `Celebrate creativity, support this arts initiative: ${campaign.title}`;
              case "sports":
                return `Help athletes achieve their dreams: ${campaign.title}`;
              case "business":
                return `Help businesses grow: ${campaign.title}`;
              case "animals":
                return `Show love for animals, support this cause: ${campaign.title}`;
              case "technology":
                return `Fuel innovation and progress: ${campaign.title}`
              case "emergency":
                return `Assist an urgent cause: ${campaign.title}`;
              default:
                return `Check out this campaign: ${campaign.title}`;
            }
          })();

          const url = window.location.href;
          const fullMessage = `${baseMessage}\n\n${url}`;

          const shareOptions = [
            {
              name: "WhatsApp",
              icon: MessageCircle,
              url: `https://wa.me/?text=${encodeURIComponent(fullMessage)}`
            },
            {
              name: "X",
              icon: Twitter,
              url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${baseMessage} ${url}`)}`
            },
            {
              name: "Facebook",
              icon: Facebook,
              url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
            },
            {
              name: "Instagram",
              icon: Instagram,
              url: url // fallback; open link manually
            },
            {
              name: "Email",
              icon: Mail,
              url: `mailto:?subject=${encodeURIComponent(`Support ${campaign.title}`)}&body=${encodeURIComponent(fullMessage)}`
            },
          ];

          return shareOptions.map(({ name, icon: Icon, url }) => (
            <Button
              key={name}
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={() => window.open(url, "_blank")}
            >
              <Icon className="w-4 h-4" />
              {name}
            </Button>
          ));
        })()}
        </div>
       </div>
      </DialogContent>
     </Dialog>
    </div>
  );
};

export default CampaignDetail;
