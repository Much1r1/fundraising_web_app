import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  Heart, 
  TrendingUp,
  Shield,
  Flag,
  Settings,
  MessageSquare,
  Clock,
  CheckCircle
} from "lucide-react";
import { ChatManagement } from "@/components/admin/ChatManagement";
import { CampaignManagement } from "@/components/admin/CampaignManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { ReportsManagement } from "@/components/admin/ReportsManagement";
import { LiveActivityWidget } from "@/components/admin/LiveActivityWidget";
import { AdminNotificationDropdown } from "@/components/admin/AdminNotificationDropdown";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    pendingCampaigns: 0,
    approvedCampaigns: 0,
    totalDonations: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    // Set up real-time subscriptions for stats updates
    const usersChannel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchStats();
      })
      .subscribe();

    const campaignsChannel = supabase
      .channel('campaigns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, () => {
        fetchStats();
      })
      .subscribe();

    const donationsChannel = supabase
      .channel('donations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(campaignsChannel);
      supabase.removeChannel(donationsChannel);
    };
  }, [isAdmin]);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access this page.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !roles) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      await fetchStats();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Fetch all campaigns
      const { count: campaignsCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true });

      // Fetch pending campaigns count
      const { count: pendingCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "pending");

      // Fetch approved campaigns count
      const { count: approvedCount } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "approved");

      // Fetch donations count and total amount from approved campaigns
      const { data: donations } = await supabase
        .from("donations")
        .select("amount, campaign_id, campaigns!inner(approval_status)")
        .eq("campaigns.approval_status", "approved");

      const totalAmount = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      setStats({
        totalUsers: usersCount || 0,
        totalCampaigns: campaignsCount || 0,
        pendingCampaigns: pendingCount || 0,
        approvedCampaigns: approvedCount || 0,
        totalDonations: donations?.length || 0,
        totalAmount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your platform</p>
            </div>
          </div>
          <AdminNotificationDropdown />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 hover:border-primary/50 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Campaigns
              </CardTitle>
              <Heart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Campaigns
              </CardTitle>
              <Clock className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingCampaigns}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved Campaigns
              </CardTitle>
              <CheckCircle className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.approvedCampaigns}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donations
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonations}</div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Raised
              </CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KSh {stats.totalAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Widget */}
        <div className="mb-8">
          <LiveActivityWidget />
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignManagement />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ChatManagement />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
