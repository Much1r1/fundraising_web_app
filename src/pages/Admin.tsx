import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle,
  Download,
  Flag,
  Shield,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const analyticsData = [
  { name: "Jan", donations: 12400, campaigns: 240, users: 400 },
  { name: "Feb", donations: 13000, campaigns: 300, users: 500 },
  { name: "Mar", donations: 15600, campaigns: 200, users: 600 },
  { name: "Apr", donations: 18200, campaigns: 278, users: 700 },
  { name: "May", donations: 19000, campaigns: 189, users: 800 },
  { name: "Jun", donations: 21000, campaigns: 239, users: 900 },
];

const campaignsByCategory = [
  { name: "Medical", value: 35, color: "#3b82f6" },
  { name: "Emergency", value: 25, color: "#ef4444" },
  { name: "Education", value: 20, color: "#10b981" },
  { name: "Animals", value: 12, color: "#f59e0b" },
  { name: "Others", value: 8, color: "#8b5cf6" },
];

const recentCampaigns = [
  {
    id: 1,
    title: "Emergency Surgery for Sarah",
    creator: "John Smith",
    goal: 50000,
    raised: 32500,
    status: "pending",
    flagged: false,
  },
  {
    id: 2,
    title: "Help Build School Library",
    creator: "Mary Johnson",
    goal: 25000,
    raised: 18750,
    status: "approved",
    flagged: false,
  },
  {
    id: 3,
    title: "Save the Stray Dogs",
    creator: "Pet Rescue Inc",
    goal: 15000,
    raised: 8500,
    status: "pending",
    flagged: true,
  },
];

export default function Admin() {
  const [stats, setStats] = useState({
    totalUsers: 12547,
    totalCampaigns: 1834,
    totalDonations: 2847592,
    pendingApprovals: 23
  });
  const { toast } = useToast();

  useEffect(() => {
    // Here you would fetch real data from Supabase
    // This is mock data for demonstration
  }, []);

  const handleApproveCampaign = async (campaignId: number) => {
    toast({
      title: "Campaign Approved",
      description: "The campaign has been approved and is now live.",
    });
  };

  const handleRejectCampaign = async (campaignId: number) => {
    toast({
      title: "Campaign Rejected",
      description: "The campaign has been rejected and removed.",
      variant: "destructive",
    });
  };

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage campaigns, users, and monitor platform activity</p>
        </div>
        <Button onClick={exportData} className="bg-gradient-primary">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats.totalDonations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+15.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Donations, campaigns, and user growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="donations" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="campaigns" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaigns by Category</CardTitle>
                <CardDescription>Distribution of campaigns across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={campaignsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {campaignsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Management</CardTitle>
              <CardDescription>Review and moderate campaigns awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{campaign.title}</h3>
                        {campaign.flagged && <Flag className="h-4 w-4 text-destructive" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">By {campaign.creator}</p>
                      <p className="text-sm">
                        KES {campaign.raised.toLocaleString()} raised of KES {campaign.goal.toLocaleString()} goal
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={campaign.status === "approved" ? "default" : "secondary"}
                        className={campaign.status === "approved" ? "bg-success" : ""}
                      >
                        {campaign.status}
                      </Badge>
                      {campaign.status === "pending" && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveCampaign(campaign.id)}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleRejectCampaign(campaign.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Monitor user activity and manage accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>User management interface would go here</p>
                <p className="text-sm mt-2">Features: Ban users, view profiles, activity logs</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Detection</CardTitle>
              <CardDescription>Monitor suspicious activities and prevent fraudulent campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fraud detection dashboard would go here</p>
                <p className="text-sm mt-2">Features: AI-powered detection, manual reviews, blacklists</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}