import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import StreakTracker from "@/components/StreakTracker";
import { CampaignAnalytics } from "@/components/CampaignAnalytics";
import { 
  Mail, MapPin, Calendar, Edit, Heart, DollarSign, FileText, 
  Lock, LogOut, CreditCard, Bell, TrendingUp, Users, 
  AlertCircle, CheckCircle, Repeat, X 
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const navigate = useNavigate();

  type ProfileData = {
    name: string;
    email: string;
    location?: string;
    joinedDate?: string;
    bio?: string;
    avatarUrl?: string;
    userId?: string;
    showNamePublicly?: boolean;
  };

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Recurring donation state
  const [recurringAmount, setRecurringAmount] = useState("");
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const buildProfile = (u: any): ProfileData => {
    const meta = (u?.user_metadata as any) || {};
    const name = meta.full_name || meta.name || (u?.email ? u.email.split("@")[0] : "User");
    const avatarUrl = meta.avatar_url || meta.picture || "";
    const joinedDate = u?.created_at
      ? new Date(u.created_at).toLocaleString("en-US", { month: "long", year: "numeric" })
      : undefined;
    return {
      name,
      email: u?.email || "",
      location: meta.location || "—",
      joinedDate,
      bio: meta.bio || "",
      avatarUrl,
      userId: u?.id,
      showNamePublicly: meta.show_name_publicly !== false,
    };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setProfile(buildProfile(session.user));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setProfile(buildProfile(session.user));
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch user analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["user-analytics", profile?.userId],
    enabled: !!profile?.userId,
    queryFn: async () => {
      const userId = profile!.userId!;
      
      // Get total donations and count
      const { data: donationsData, error: donationsError } = await supabase
        .from("donations")
        .select("amount")
        .eq("donor_id", userId)
        .eq("payment_status", "completed");

      if (donationsError) throw donationsError;

      const totalDonated = donationsData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const donationsCount = donationsData?.length || 0;

      // Get unique campaigns supported
      const uniqueCampaigns = new Set(donationsData?.map(d => (d as any).campaign_id)).size;

      // Get recurring subscriptions count
      const { count: recurringCount, error: recurringError } = await supabase
        .from("recurring_subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("active", true);

      if (recurringError) throw recurringError;

      return {
        totalDonated,
        donationsCount,
        campaignsSupported: uniqueCampaigns,
        recurringSubscriptions: recurringCount || 0,
      };
    },
  });

  // Fetch user donations
  const { data: donations = [], isLoading: donationsLoading } = useQuery({
    queryKey: ["user-donations", profile?.userId],
    enabled: !!profile?.userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("id, amount, created_at, payment_status, campaign_id, is_anonymous")
        .eq("donor_id", profile!.userId!)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recurring subscriptions
  const { data: subscriptions = [], isLoading: subscriptionsLoading, refetch: refetchSubscriptions } = useQuery({
    queryKey: ["user-subscriptions", profile?.userId],
    enabled: !!profile?.userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring_subscriptions")
        .select("*")
        .eq("user_id", profile!.userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["user-notifications", profile?.userId],
    enabled: !!profile?.userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile!.userId!)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user campaigns
  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: ["user-campaigns", profile?.userId],
    enabled: !!profile?.userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", profile!.userId!)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }
      return data || [];
    },
  });

  // Handle password change
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in both password fields", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: "Success", description: "Password updated successfully" });
      setShowPasswordDialog(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      toast({ title: "Logged out", description: "You have been logged out successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Handle anonymous toggle
  const handleAnonymousToggle = async (checked: boolean) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { show_name_publicly: checked }
      });

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, showNamePublicly: checked } : null);
      toast({ 
        title: "Updated", 
        description: checked 
          ? "Your name will appear on donation feeds" 
          : "You will appear as anonymous on future donations" 
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Create recurring subscription
  const handleCreateRecurring = async () => {
    if (!recurringAmount || parseFloat(recurringAmount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    try {
      // Create Stripe subscription checkout session
      const { data, error } = await supabase.functions.invoke('create-stripe-session', {
        body: {
          type: 'subscription',
          userId: profile!.userId!,
          amount: parseFloat(recurringAmount),
          metadata: {
            frequency: recurringFrequency,
            enableReminders: reminderEnabled.toString(),
            email: profile?.email,
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        toast({
          title: "Redirecting",
          description: "Setting up your recurring donation...",
        });
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from("recurring_subscriptions")
        .update({ active: false })
        .eq("id", subscriptionId);

      if (error) throw error;

      refetchSubscriptions();
      toast({ title: "Cancelled", description: "Recurring donation cancelled" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (!profile) {
    return <div className="p-12 text-center text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 border-2 shadow-lg animate-fade-in">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback className="text-2xl gradient-primary text-primary-foreground">
                  {(profile?.name || "U").split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl">{profile?.name || "—"}</h1>
                  <Badge className="bg-primary w-fit">Verified Donor</Badge>
                </div>

                <p className="text-muted-foreground mb-4">{profile?.bio || ""}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile?.email || "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile?.location || "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {profile?.joinedDate || "—"}
                  </span>
                </div>
              </div>

              <Button variant="outline" className="gap-2" onClick={() => navigate("/profile/edit")}>
               <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Analytics & Quick Actions */}
          <div className="space-y-6 animate-slide-up">
            {/* Analytics Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <span className="text-muted-foreground">Total Donated</span>
                      <span className="font-bold text-xl text-primary">
                        KSh {analytics?.totalDonated.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <span className="text-muted-foreground">Donations</span>
                      <span className="font-bold text-xl">{analytics?.donationsCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <span className="text-muted-foreground">Campaigns Supported</span>
                      <span className="font-bold text-xl">{analytics?.campaignsSupported || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <span className="text-muted-foreground">Recurring</span>
                      <span className="font-bold text-xl">{analytics?.recurringSubscriptions || 0}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            {/* Donation Privacy */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="public-name">Show my name publicly</Label>
                    <p className="text-xs text-muted-foreground">
                      If disabled, you'll appear as anonymous
                    </p>
                  </div>
                  <Switch 
                    id="public-name"
                    checked={profile.showNamePublicly}
                    onCheckedChange={handleAnonymousToggle}
                  />
                </div>
              </CardContent>
            </Card>

            <StreakTracker
              currentStreak={donations.length > 0 ? 5 : 0}
              longestStreak={donations.length > 0 ? 10 : 0}
              totalDonations={donations.length}
              badges={donations.length > 0 ? ["starter", "champion"] : []}
            />
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Tabs defaultValue="donations" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="donations" className="gap-2">
                  <Heart className="w-4 h-4" /> Donations
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="gap-2">
                  <FileText className="w-4 h-4" /> Campaigns
                </TabsTrigger>
                <TabsTrigger value="recurring" className="gap-2">
                  <Repeat className="w-4 h-4" /> Recurring
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="w-4 h-4" /> Payments
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" /> Alerts
                </TabsTrigger>
              </TabsList>

              {/* Donations Tab */}
              <TabsContent value="donations" className="mt-6 space-y-4">
                {donationsLoading ? (
                  <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                ) : donations.length === 0 ? (
                  <Card><CardContent className="p-6 text-center text-muted-foreground">No donations yet.</CardContent></Card>
                ) : (
                  donations.map((d: any) => (
                    <Card key={d.id} className="border hover:border-primary/50 transition-smooth">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold mb-1">Campaign Donation</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(d.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                          {d.is_anonymous && (
                            <Badge variant="secondary" className="mt-2">Anonymous</Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">KSh {Number(d.amount).toLocaleString()}</p>
                          <Badge variant="outline" className="mt-1">{d.payment_status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* My Campaigns Tab */}
              <TabsContent value="campaigns" className="mt-6 space-y-4">
                {/* Campaigns Started Summary */}
                {campaigns.length > 0 && (
                  <Card className="border-2 bg-gradient-to-br from-primary/10 to-accent/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Campaigns Started
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Total Campaigns</p>
                          <p className="text-3xl font-bold">{campaigns.length}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">First Campaign</p>
                          <p className="text-lg font-semibold">
                            {new Date(Math.min(...campaigns.map((c: any) => new Date(c.created_at).getTime()))).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Latest Campaign</p>
                          <p className="text-lg font-semibold">
                            {new Date(Math.max(...campaigns.map((c: any) => new Date(c.created_at).getTime()))).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>My Campaigns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {campaignsLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : campaignsError ? (
                      <div className="text-destructive p-4 border border-destructive/50 rounded-lg">
                        <p className="font-medium">Error loading campaigns</p>
                        <p className="text-sm mt-1">{campaignsError.message}</p>
                      </div>
                    ) : campaigns.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">No campaigns created yet</p>
                        <Button onClick={() => navigate("/campaigns/create")}>
                          Create Your First Campaign
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {campaigns.map((campaign: any) => (
                          <div key={campaign.id} className="space-y-4">
                            <Card className="border">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-lg mb-2">{campaign.title}</h4>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        KSh {Number(campaign.current_amount).toLocaleString()} / KSh {Number(campaign.goal_amount).toLocaleString()}
                                      </span>
                                      <Badge variant={
                                        campaign.approval_status === 'approved' ? 'default' :
                                        campaign.approval_status === 'pending' ? 'secondary' :
                                        'destructive'
                                      }>
                                        {campaign.approval_status}
                                      </Badge>
                                      <Badge variant="outline">
                                        {campaign.campaign_status}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Created {new Date(campaign.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                            
                            {/* Campaign Analytics */}
                            {campaign.approval_status === 'approved' && (
                              <CampaignAnalytics campaignId={campaign.id} />
                            )}
                            
                            <Separator />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recurring Donations Tab */}
              <TabsContent value="recurring" className="mt-6 space-y-6">
                {/* Create New Recurring */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Create Recurring Donation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount (KSh)</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="500"
                          value={recurringAmount}
                          onChange={(e) => setRecurringAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                          <SelectTrigger id="frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="reminder"
                        checked={reminderEnabled}
                        onCheckedChange={setReminderEnabled}
                      />
                      <Label htmlFor="reminder">Enable reminders</Label>
                    </div>

                    <Button onClick={handleCreateRecurring} className="w-full">
                      <Repeat className="w-4 h-4 mr-2" />
                      Create Recurring Donation
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      Note: You'll need to complete payment method setup to activate recurring donations.
                    </p>
                  </CardContent>
                </Card>

                {/* Active Subscriptions */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Active Subscriptions</h3>
                  {subscriptionsLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : subscriptions.filter((s: any) => s.active).length === 0 ? (
                    <Card><CardContent className="p-6 text-center text-muted-foreground">
                      No active recurring donations
                    </CardContent></Card>
                  ) : (
                    subscriptions.filter((s: any) => s.active).map((sub: any) => (
                      <Card key={sub.id} className="border">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="capitalize">{sub.frequency}</Badge>
                                <Badge variant="outline">{sub.payment_method || "Setup pending"}</Badge>
                              </div>
                              <p className="text-2xl font-bold text-primary mb-1">
                                KSh {Number(sub.amount).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Started {new Date(sub.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <AlertDialog>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {}}
                              >
                                <X className="w-4 h-4 text-destructive" />
                              </Button>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will stop future recurring donations. You can always create a new one later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Active</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCancelSubscription(sub.id)}>
                                    Cancel Subscription
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Payment Methods Tab */}
              <TabsContent value="payments" className="mt-6 space-y-4">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Add payment methods to enable quick donations and recurring payments
                    </p>

                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={async () => {
                          try {
                            const { data, error } = await supabase.functions.invoke('create-stripe-session', {
                              body: {
                                type: 'setup',
                                userId: profile?.userId,
                                metadata: { email: profile?.email },
                              },
                            });
                            if (error) throw error;
                            if (data?.url) window.location.href = data.url;
                          } catch (error: any) {
                            toast({
                              title: "Error",
                              description: error.message || "Failed to setup payment method",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <CreditCard className="w-4 h-4" />
                        Add Credit/Debit Card (Stripe)
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          toast({
                            title: "Coming Soon",
                            description: "PayPal integration will be available soon.",
                          });
                        }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l1.12-7.106c.082-.518.526-.9 1.05-.9h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.15.054-.295.077-.437a4.43 4.43 0 0 0-.859-.68z"/>
                        </svg>
                        Connect PayPal
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={async () => {
                          // Check if Payment Request API is available
                          if (!window.PaymentRequest) {
                            toast({
                              title: "Not Supported",
                              description: "Google Pay is not supported on this browser.",
                              variant: "destructive",
                            });
                            return;
                          }
                          toast({
                            title: "Coming Soon",
                            description: "Google Pay integration requires additional setup.",
                          });
                        }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm7.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z"/>
                        </svg>
                        Google Pay
                      </Button>
                    </div>

                    <Separator />

                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Setup Instructions
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                        <li>Configure STRIPE_SECRET_KEY in Supabase secrets</li>
                        <li>Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET</li>
                        <li>For Google Pay: set GOOGLE_PAY_MERCHANT_ID</li>
                        <li>Create webhook endpoints for payment confirmations</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="mt-6 space-y-4">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Email Notifications</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>In-App Notifications</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Donation Reminders</Label>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="font-semibold">Recent Notifications</h3>
                  {notificationsLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : notifications.length === 0 ? (
                    <Card><CardContent className="p-6 text-center text-muted-foreground">
                      No notifications yet
                    </CardContent></Card>
                  ) : (
                    notifications.map((notif: any) => (
                      <Card key={notif.id} className={!notif.is_read ? "border-primary/50" : ""}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${!notif.is_read ? 'text-primary' : 'text-muted-foreground'}`}>
                              {notif.type === 'donation' ? <Heart className="w-4 h-4" /> : 
                               notif.type === 'milestone' ? <TrendingUp className="w-4 h-4" /> :
                               <Bell className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{notif.title}</p>
                              <p className="text-sm text-muted-foreground">{notif.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Password Change Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your new password below
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setNewPassword("");
              setConfirmPassword("");
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleChangePassword}>
              Change Password
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
