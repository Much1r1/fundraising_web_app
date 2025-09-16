import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { StreakTracker } from "@/components/gamification/StreakTracker";
import { 
  Heart, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ArrowRight, 
  Star,
  Award,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

// Import generated images
import campaignMedical from "@/assets/campaign-medical.jpg";
import campaignEmergency from "@/assets/campaign-emergency.jpg";
import campaignAnimals from "@/assets/campaign-animals.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const featuredCampaigns = [
  {
    id: "1",
    title: "Help Maria Get Life-Saving Surgery",
    description: "Maria needs urgent surgery to save her life. Every donation brings hope to her family.",
    image: campaignMedical,
    goal: 50000,
    raised: 32500,
    donorsCount: 234,
    daysLeft: 15,
    category: "Medical",
    location: "San Francisco, CA",
    organizer: { name: "John Smith", avatar: avatar1 },
    isVerified: true,
    isTrending: true,
  },
  {
    id: "2", 
    title: "Rebuild After Hurricane Damage",
    description: "Help our community rebuild homes and lives after the devastating hurricane.",
    image: campaignEmergency,
    goal: 75000,
    raised: 45800,
    donorsCount: 567,
    daysLeft: 28,
    category: "Emergency",
    location: "Miami, FL",
    organizer: { name: "Sarah Johnson", avatar: avatar2 },
    isVerified: true,
    isTrending: false,
  },
  {
    id: "3",
    title: "Support Local Animal Shelter",
    description: "Help us provide food, medical care, and shelter for abandoned animals.",
    image: campaignAnimals, 
    goal: 25000,
    raised: 18750,
    donorsCount: 189,
    daysLeft: 42,
    category: "Animals",
    location: "Austin, TX",
    organizer: { name: "Animal Care Team", avatar: avatar3 },
    isVerified: false,
    isTrending: true,
  },
];

const stats = [
  { label: "Total Raised", value: "$2.4M", icon: DollarSign, color: "text-success" },
  { label: "Active Campaigns", value: "1,247", icon: TrendingUp, color: "text-primary" },
  { label: "Happy Donors", value: "15,432", icon: Users, color: "text-donation" },
  { label: "Success Rate", value: "94%", icon: Star, color: "text-warning" },
];

const leaderboardData = [
  { rank: 1, name: "Emma Thompson", amount: 12500, badge: "🥇", streak: 45 },
  { rank: 2, name: "Michael Chen", amount: 9800, badge: "🥈", streak: 32 },
  { rank: 3, name: "Sarah Wilson", amount: 8600, badge: "🥉", streak: 28 },
  { rank: 4, name: "David Rodriguez", amount: 7200, badge: "🏆", streak: 21 },
  { rank: 5, name: "Lisa Park", amount: 6800, badge: "⭐", streak: 18 },
];

const mockUserStreak = {
  currentStreak: 7,
  longestStreak: 21,
  nextMilestone: 10,
  totalDonations: 15,
  badges: [
    { id: "1", name: "First Donation", icon: "🎯", color: "bronze" as const, earned: true },
    { id: "2", name: "Week Warrior", icon: "🔥", color: "silver" as const, earned: true },
    { id: "3", name: "Month Master", icon: "👑", color: "gold" as const, earned: false },
    { id: "4", name: "Streak Legend", icon: "⚡", color: "gold" as const, earned: false },
  ],
};

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Turn Compassion Into
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Real Change
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Join thousands making a difference. Start a campaign or support a cause close to your heart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create-campaign">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Your Campaign
                </Button>
              </Link>
              <Link to="/campaigns">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Explore Causes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-20 left-10 text-4xl opacity-20"
        >
          💝
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-32 right-20 text-5xl opacity-20"
        >
          🌟
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center shadow-soft hover:shadow-medium transition-all">
                  <CardContent className="pt-6">
                    <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Campaigns</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover inspiring stories and make an immediate impact on lives around the world.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CampaignCard {...campaign} />
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/campaigns">
              <Button variant="outline" size="lg">
                View All Campaigns
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Gamification & Leaderboard */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Streak Tracker */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Your Impact Journey</h3>
              <StreakTracker {...mockUserStreak} />
            </div>

            {/* Leaderboard */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="h-6 w-6 text-badge-gold" />
                Top Contributors
              </h3>
              <Card className="shadow-soft">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {leaderboardData.map((donor, index) => (
                      <motion.div
                        key={donor.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{donor.badge}</span>
                          <div>
                            <p className="font-medium">{donor.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {donor.streak} day streak 🔥
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${donor.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">donated</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Link to="/leaderboard">
                      <Button variant="outline">
                        View Full Leaderboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Whether you want to start your own campaign or support existing causes, 
              every action creates ripples of positive change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create-campaign">
                <Button size="lg" variant="secondary">
                  <Heart className="mr-2 h-5 w-5" />
                  Start Fundraising
                </Button>
              </Link>
              <Link to="/campaigns">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Support a Cause
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}