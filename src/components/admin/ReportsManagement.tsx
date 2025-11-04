import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, TrendingUp, Users, DollarSign, Award } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DonationSummary {
  period: string;
  amount: number;
  count: number;
}

interface CampaignPerformance {
  id: string;
  title: string;
  goal_amount: number;
  current_amount: number;
  percentage: number;
  donors: number;
}

interface TopDonor {
  id: string;
  name: string;
  email: string;
  total: number;
  donations: number;
}

interface CategoryStats {
  category: string;
  campaigns: number;
  total_raised: number;
}

interface UserStats {
  active: number;
  inactive: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8884d8", "#82ca9d", "#ffc658"];

export function ReportsManagement() {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [donationSummary, setDonationSummary] = useState<DonationSummary[]>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance[]>([]);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, [timeframe]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDonationSummary(),
        fetchCampaignPerformance(),
        fetchTopDonors(),
        fetchCategoryStats(),
        fetchUserStats(),
      ]);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationSummary = async () => {
    const { data, error } = await supabase
      .from("donations")
      .select("amount, created_at")
      .eq("payment_status", "completed")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const summary = processDonationsByTimeframe(data || [], timeframe);
    setDonationSummary(summary);
  };

  const processDonationsByTimeframe = (donations: any[], timeframe: string): DonationSummary[] => {
    const grouped: { [key: string]: { amount: number; count: number } } = {};

    donations.forEach((donation) => {
      const date = new Date(donation.created_at);
      let key: string;

      if (timeframe === "daily") {
        key = date.toISOString().split("T")[0];
      } else if (timeframe === "weekly") {
        const week = Math.floor(date.getDate() / 7) + 1;
        key = `${date.getFullYear()}-${date.getMonth() + 1}-W${week}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!grouped[key]) {
        grouped[key] = { amount: 0, count: 0 };
      }
      grouped[key].amount += Number(donation.amount);
      grouped[key].count += 1;
    });

    return Object.entries(grouped)
      .map(([period, stats]) => ({
        period,
        amount: stats.amount,
        count: stats.count,
      }))
      .slice(-12);
  };

  const fetchCampaignPerformance = async () => {
    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        id,
        title,
        goal_amount,
        current_amount,
        donations(count)
      `)
      .eq("approval_status", "approved")
      .limit(10);

    if (error) throw error;

    const performance = (data || []).map((campaign: any) => ({
      id: campaign.id,
      title: campaign.title,
      goal_amount: Number(campaign.goal_amount),
      current_amount: Number(campaign.current_amount),
      percentage: (Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100,
      donors: campaign.donations[0]?.count || 0,
    }));

    setCampaignPerformance(performance);
  };

  const fetchTopDonors = async () => {
    const { data, error } = await supabase
      .from("donations")
      .select(`
        donor_id,
        amount,
        users(full_name, email)
      `)
      .eq("payment_status", "completed")
      .not("donor_id", "is", null);

    if (error) throw error;

    const donorMap: { [key: string]: { name: string; email: string; total: number; count: number } } = {};

    (data || []).forEach((donation: any) => {
      const donorId = donation.donor_id;
      if (!donorMap[donorId]) {
        donorMap[donorId] = {
          name: donation.users?.full_name || "Anonymous",
          email: donation.users?.email || "",
          total: 0,
          count: 0,
        };
      }
      donorMap[donorId].total += Number(donation.amount);
      donorMap[donorId].count += 1;
    });

    const topDonorsList = Object.entries(donorMap)
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        email: stats.email,
        total: stats.total,
        donations: stats.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    setTopDonors(topDonorsList);
  };

  const fetchCategoryStats = async () => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("category, current_amount")
      .eq("approval_status", "approved");

    if (error) throw error;

    const categoryMap: { [key: string]: { campaigns: number; total_raised: number } } = {};

    (data || []).forEach((campaign) => {
      if (!categoryMap[campaign.category]) {
        categoryMap[campaign.category] = { campaigns: 0, total_raised: 0 };
      }
      categoryMap[campaign.category].campaigns += 1;
      categoryMap[campaign.category].total_raised += Number(campaign.current_amount);
    });

    const stats = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      campaigns: data.campaigns,
      total_raised: data.total_raised,
    }));

    setCategoryStats(stats);
  };

  const fetchUserStats = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("is_active");

    if (error) throw error;

    const active = (data || []).filter((user) => user.is_active).length;
    const inactive = (data || []).length - active;

    setUserStats({ active, inactive });
  };

  const exportToCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";

      // Donation Summary
      csvContent += "Donation Summary\n";
      csvContent += "Period,Amount,Count\n";
      donationSummary.forEach((row) => {
        csvContent += `${row.period},${row.amount},${row.count}\n`;
      });

      csvContent += "\n\nTop Donors\n";
      csvContent += "Name,Email,Total Donated,Number of Donations\n";
      topDonors.forEach((donor) => {
        csvContent += `${donor.name},${donor.email},${donor.total},${donor.donations}\n`;
      });

      csvContent += "\n\nCategory Performance\n";
      csvContent += "Category,Campaigns,Total Raised\n";
      categoryStats.forEach((stat) => {
        csvContent += `${stat.category},${stat.campaigns},${stat.total_raised}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `reports_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error("Failed to export CSV");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Admin Reports", 14, 20);
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

      // Donation Summary
      autoTable(doc, {
        head: [["Period", "Amount", "Count"]],
        body: donationSummary.map((row) => [row.period, `$${row.amount.toFixed(2)}`, row.count]),
        startY: 35,
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Top Donors
      autoTable(doc, {
        head: [["Name", "Email", "Total Donated", "Donations"]],
        body: topDonors.map((donor) => [
          donor.name,
          donor.email,
          `$${donor.total.toFixed(2)}`,
          donor.donations,
        ]),
        startY: (doc as any).lastAutoTable.finalY + 10,
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Category Performance
      autoTable(doc, {
        head: [["Category", "Campaigns", "Total Raised"]],
        body: categoryStats.map((stat) => [
          stat.category,
          stat.campaigns,
          `$${stat.total_raised.toFixed(2)}`,
        ]),
        startY: (doc as any).lastAutoTable.finalY + 10,
        headStyles: { fillColor: [99, 102, 241] },
      });

      doc.save(`reports_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into your platform</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${donationSummary.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {donationSummary.reduce((sum, item) => sum + item.count, 0)} donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignPerformance.length}</div>
            <p className="text-xs text-muted-foreground">Approved campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.active}</div>
            <p className="text-xs text-muted-foreground">{userStats.inactive} inactive</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Donor</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${topDonors[0]?.total.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">{topDonors[0]?.name || "No donors"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Reports */}
      <Tabs defaultValue="donations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="donors">Top Donors</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        {/* Donations Tab */}
        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Donation Summary</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={timeframe === "daily" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe("daily")}
                  >
                    Daily
                  </Button>
                  <Button
                    variant={timeframe === "weekly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe("weekly")}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={timeframe === "monthly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe("monthly")}
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={donationSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" name="Amount ($)" />
                  <Bar dataKey="count" fill="hsl(var(--secondary))" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={campaignPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="title" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current_amount" fill="hsl(var(--primary))" name="Raised ($)" />
                  <Bar dataKey="goal_amount" fill="hsl(var(--secondary))" name="Goal ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Donors Tab */}
        <TabsContent value="donors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDonors.map((donor, index) => (
                  <div key={donor.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{donor.name}</p>
                        <p className="text-sm text-muted-foreground">{donor.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${donor.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{donor.donations} donations</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaigns by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      dataKey="campaigns"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Raised by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_raised" fill="hsl(var(--primary))" name="Amount ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Active vs Inactive Users</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active", value: userStats.active },
                        { name: "Inactive", value: userStats.inactive },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="font-bold">{userStats.active + userStats.inactive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Users</span>
                    <span className="font-bold text-green-600">{userStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Inactive Users</span>
                    <span className="font-bold text-red-600">{userStats.inactive}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Active Rate</span>
                    <span className="font-bold">
                      {((userStats.active / (userStats.active + userStats.inactive)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
