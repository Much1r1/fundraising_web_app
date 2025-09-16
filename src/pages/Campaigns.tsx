import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CampaignCard } from "@/components/campaign/CampaignCard";
import { Search, Filter, MapPin, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// Import generated images
import campaignMedical from "@/assets/campaign-medical.jpg";
import campaignEmergency from "@/assets/campaign-emergency.jpg";
import campaignAnimals from "@/assets/campaign-animals.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

// Mock campaigns data
const allCampaigns = [
  {
    id: "1",
    title: "Help Maria Get Life-Saving Surgery",
    description: "Maria needs urgent surgery to save her life. Every donation brings hope to her family and community members who care about her.",
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
    description: "Help our community rebuild homes and lives after the devastating hurricane that destroyed everything we worked for.",
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
    description: "Help us provide food, medical care, and shelter for abandoned animals who need our love and support to survive.",
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
  // Additional campaigns for variety
  {
    id: "4",
    title: "Education Fund for Underprivileged Children",
    description: "Providing quality education and school supplies for children in need across our community.",
    image: campaignMedical,
    goal: 40000,
    raised: 15200,
    donorsCount: 98,
    daysLeft: 35,
    category: "Education",
    location: "Los Angeles, CA",
    organizer: { name: "Teachers United", avatar: avatar1 },
    isVerified: true,
    isTrending: false,
  },
  {
    id: "5",
    title: "Clean Water Initiative",
    description: "Building wells and water purification systems in rural communities that lack access to clean drinking water.",
    image: campaignEmergency,
    goal: 80000,
    raised: 23400,
    donorsCount: 156,
    daysLeft: 60,
    category: "Environment",
    location: "Rural Kenya",
    organizer: { name: "Water for All", avatar: avatar2 },
    isVerified: true,
    isTrending: true,
  },
  {
    id: "6",
    title: "Food Bank Expansion Project",
    description: "Expanding our food bank to serve more families in need during these challenging times.",
    image: campaignAnimals,
    goal: 30000,
    raised: 22100,
    donorsCount: 234,
    daysLeft: 20,
    category: "Community",
    location: "Chicago, IL",
    organizer: { name: "Community Care", avatar: avatar3 },
    isVerified: false,
    isTrending: false,
  },
];

const categories = ["All", "Medical", "Emergency", "Animals", "Education", "Environment", "Community"];
const sortOptions = ["Most Recent", "Most Funded", "Trending", "Ending Soon", "Goal Amount"];

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [showFilters, setShowFilters] = useState(false);

  const filteredCampaigns = allCampaigns
    .filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || campaign.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Most Funded":
          return b.raised - a.raised;
        case "Trending":
          return b.isTrending ? 1 : -1;
        case "Ending Soon":
          return a.daysLeft - b.daysLeft;
        case "Goal Amount":
          return b.goal - a.goal;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Discover Campaigns</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore thousands of campaigns making a difference worldwide. Find a cause you care about and make an impact today.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg shadow-soft p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input placeholder="City, State, Country" className="pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Goal Range</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-5000">$0 - $5,000</SelectItem>
                      <SelectItem value="5000-25000">$5,000 - $25,000</SelectItem>
                      <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                      <SelectItem value="50000+">$50,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Time Left</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Select>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Less than 7 days</SelectItem>
                        <SelectItem value="30">Less than 30 days</SelectItem>
                        <SelectItem value="90">Less than 90 days</SelectItem>
                        <SelectItem value="all">Any time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Trending campaigns
          </Badge>
          {selectedCategory !== "All" && (
            <Badge variant="outline">
              Category: {selectedCategory}
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="outline">
              Search: "{searchTerm}"
            </Badge>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCampaigns.length} campaigns
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign, index) => (
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

        {/* No Results */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find more campaigns.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSortBy("Most Recent");
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {filteredCampaigns.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Campaigns
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}