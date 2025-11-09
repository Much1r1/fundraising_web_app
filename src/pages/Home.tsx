import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, TrendingUp, Users, Award, Loader2 } from "lucide-react";
import CampaignCard from "@/components/CampaignCard";
import GlobalActivityFeed from "@/components/GlobalActivityFeed";

const Home = () => {
  // Fetch featured campaigns
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["featured-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("current_amount", { ascending: false })
        .limit(6);

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return data;
    },
  });

  const getDaysLeft = (endDate: string | null) => {
    if (!endDate) return undefined;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 gradient-hero overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center animate-fade-in">
            <h1 className="text-primary-foreground mb-6">
              Turn Compassion Into Action
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands making a difference. Start a campaign, support a cause, and track your impact with our crowdfunding platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="accent">
                Start a Campaign
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20 backdrop-blur-sm">
                Browse Campaigns
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-slide-up">
            {[
              { icon: Heart, label: "Total Raised", value: "KSh 25M+" },
              { icon: Users, label: "Active Donors", value: "15K+" },
              { icon: TrendingUp, label: "Success Rate", value: "92%" },
              { icon: Award, label: "Campaigns Funded", value: "3.2K+" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-white" />
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-foreground mb-2">Featured Campaigns</h2>
              <p className="text-muted-foreground">Stories that inspire action</p>
            </div>
            <Link to="/campaigns">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading campaigns...</p>
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              campaigns.map((campaign) => (
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
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No campaigns available yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Global Activity Feed */}
      <section className="py-16 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="text-foreground mb-2">Recent Activity</h2>
            <p className="text-muted-foreground">See the latest donations from our community</p>
          </div>
          <GlobalActivityFeed />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Campaign",
                description: "Share your story and set your funding goal"
              },
              {
                step: "2",
                title: "Share & Engage",
                description: "Spread the word and build your supporter community"
              },
              {
                step: "3",
                title: "Track Impact",
                description: "Watch donations grow and celebrate milestones"
              }
            ].map((step, i) => (
              <div key={i} className="text-center animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto mb-4 shadow-glow">
                  {step.step}
                </div>
                <h3 className="mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our community of givers and change-makers today
          </p>
          <Button size="lg" variant="accent">
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
