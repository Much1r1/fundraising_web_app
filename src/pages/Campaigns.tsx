import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, TrendingUp, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CampaignCard from "@/components/CampaignCard";
import { useToast } from "@/hooks/use-toast";

const Campaigns = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("relevant");
  const { toast } = useToast();

  // Fetch campaigns from Supabase
  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ["campaigns", category, searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("campaigns")
        .select("*")
        .eq("visibility", "public")
        .in("campaign_status", ["active", "completed"]);

      // Filter by category
      if (category !== "all") {
        query = query.eq("category", category);
      }

      // Search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Sorting
      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false });
          break;
        case "popular":
          query = query.order("current_amount", { ascending: false });
          break;
        case "ending":
          query = query.order("end_date", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return data;
    },
  });

  // Show error toast if fetch fails
  if (error) {
    toast({
      title: "Error loading campaigns",
      description: "Please try again later",
      variant: "destructive",
    });
  }

  // Calculate days left for a campaign
  const getDaysLeft = (endDate: string | null) => {
    if (!endDate) return undefined;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="mb-4">Discover Campaigns</h1>
          <p className="text-lg text-muted-foreground">
            Find causes that inspire you and make a difference today
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-md animate-slide-up">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </Button>
            <Button variant="outline" size="sm">
              Near Goal
            </Button>
            <Button variant="outline" size="sm">
              Recently Launched
            </Button>
            <Button variant="outline" size="sm">
              Most Backed
            </Button>
          </div>
        </div>

        {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {campaigns ? `Showing ${campaigns.length} campaigns` : 'Loading...'}
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevant">Most Relevant</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="ending">Ending Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="col-span-full text-center py-16">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground text-lg">Loading campaigns...</p>
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  id={campaign.id}
                  title={campaign.title}
                  description={campaign.description}
                  imageUrl={campaign.image_url || undefined}
                  goalAmount={Number(campaign.goal_amount)}
                  currentAmount={Number(campaign.current_amount)}
                  category={campaign.category}
                  location={campaign.location || undefined}
                  daysLeft={getDaysLeft(campaign.end_date)}
                  isVerified={campaign.verification_status === "verified"}
                  isTrending={Number(campaign.current_amount) > Number(campaign.goal_amount) * 0.5}
                />
              ))}
            </div>
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No campaigns found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
