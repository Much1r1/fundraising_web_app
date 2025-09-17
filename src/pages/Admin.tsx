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
  Cell,
  AreaChart,
  Area
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
  Activity,
  Target,
  Globe,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnalyticsCard } from "@/components/admin/AnalyticsCard";
import { CampaignModerationTable } from "@/components/admin/CampaignModerationTable";
import { FraudDetectionPanel } from "@/components/admin/FraudDetectionPanel";

// Enhanced analytics data
const analyticsData = [
  { name: "Jan", donations: 124000, campaigns: 24, users: 400, conversion: 3.2 },
  { name: "Feb", donations: 156000, campaigns: 32, users: 520, conversion: 3.8 },
  { name: "Mar", donations: 189000, campaigns: 28, users: 650, conversion: 4.1 },
  { name: "Apr", donations: 234000, campaigns: 35, users: 780, conversion: 4.7 },
  { name: "May", donations: 298000, campaigns: 42, users: 890, conversion: 5.2 },
  { name: "Jun", donations: 365000, campaigns: 38, users: 1020, conversion: 5.8 },
];

const hourlyData = [
  { hour: "00", donations: 45, campaigns: 2 },
  { hour: "06", donations: 120, campaigns: 5 },
  { hour: "12", donations: 340, campaigns: 12 },
  { hour: "18", donations: 280, campaigns: 8 },
  { hour: "24", donations: 95, campaigns: 3 },
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
    totalUsers: 25847,
    totalCampaigns: 3247,
    totalDonations: 8947592,
    pendingApprovals: 18,
    activeUsers: 12430,
    conversionRate: 5.8,
    avgDonation: 2850
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

      {/* Enhanced Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend={{ value: 12.5, label: "from last month" }}
          icon={<Users className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Active Campaigns"
          value={stats.totalCampaigns.toLocaleString()}
          trend={{ value: 8.2, label: "from last month" }}
          icon={<Target className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Total Donations"
          value={`KES ${stats.totalDonations.toLocaleString()}`}
          trend={{ value: 15.3, label: "from last month" }}
          icon={<DollarSign className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          description="Requires immediate attention"
          icon={<AlertTriangle className="h-4 w-4 text-warning" />}
          className="border-warning/20"
        />
      </div>

      {/* Additional KPI Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <AnalyticsCard
          title="Active Users (24h)"
          value={stats.activeUsers.toLocaleString()}
          trend={{ value: 5.2, label: "vs yesterday" }}
          icon={<Activity className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          trend={{ value: 2.1, label: "improvement" }}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Avg Donation"
          value={`KES ${stats.avgDonation.toLocaleString()}`}
          trend={{ value: -3.2, label: "from last week" }}
          icon={<Globe className="h-4 w-4" />}
        />
        
        <AnalyticsCard
          title="Platform Health"
          value="99.9%"
          description="System uptime"
          icon={<Zap className="h-4 w-4 text-success" />}
        />
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue & Growth Trends</CardTitle>
                <CardDescription>Monthly donations, campaigns, and user acquisition</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={analyticsData}>
                    <defs>
                      <linearGradient id="donationsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="donations" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#donationsGradient)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="campaigns" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaigns by Category</CardTitle>
                <CardDescription>Distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={campaignsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
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

          {/* Hourly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>24-Hour Activity Pattern</CardTitle>
              <CardDescription>Donation and campaign creation patterns throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="donations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="campaigns" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignModerationTable />
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
          <FraudDetectionPanel />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
                <CardDescription>Generate and download various reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportData} className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Campaign Performance Report
                </Button>
                <Button onClick={exportData} variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Donation Summary (Monthly)
                </Button>
                <Button onClick={exportData} variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  User Analytics Report
                </Button>
                <Button onClick={exportData} variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Fraud Detection Log
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automated report delivery settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Scheduled reporting configuration</p>
                  <p className="text-sm mt-2">Weekly, monthly, and quarterly automated reports</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}