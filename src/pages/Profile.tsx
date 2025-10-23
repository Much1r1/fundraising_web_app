import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StreakTracker from "@/components/StreakTracker";
import { Mail, MapPin, Calendar, Edit, Heart, DollarSign, FileText } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  type ProfileData = {
    name: string;
    email: string;
    location?: string;
    joinedDate?: string;
    bio?: string;
    avatarUrl?: string;
  };

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [myCampaigns, setMyCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setProfile(buildProfile(session.user));
        fetchUserData(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setProfile(buildProfile(session.user));
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    setLoading(true);

    try {
      // Fetch donations made by the user
      const { data: donationsData, error: donationsError } = await supabase
        .from("donations")
        .select("id, amount, created_at, status, campaigns(title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (donationsError) console.error("Error fetching donations:", donationsError);
      else setDonations(donationsData || []);

      // Fetch campaigns created by the user
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("id, title, status, raised_amount, goal_amount")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });

      if (campaignsError) console.error("Error fetching campaigns:", campaignsError);
      else setMyCampaigns(campaignsData || []);

    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    setLoading(false);
  };

  if (loading && !profile) {
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

              <Button variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6 animate-slide-up">
            <StreakTracker
              currentStreak={7}
              longestStreak={15}
              totalDonations={donations.length}
              badges={["starter", "champion", "hero"]}
            />

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Impact Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Donated</span>
                  <span className="font-bold text-xl">
                    KSh {donations.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Campaigns Supported</span>
                  <span className="font-bold text-xl">{donations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">My Campaigns</span>
                  <span className="font-bold text-xl">{myCampaigns.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Tabs defaultValue="donations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="donations" className="gap-2">
                  <Heart className="w-4 h-4" /> Donations
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="gap-2">
                  <DollarSign className="w-4 h-4" /> My Campaigns
                </TabsTrigger>
                <TabsTrigger value="receipts" className="gap-2">
                  <FileText className="w-4 h-4" /> Receipts
                </TabsTrigger>
              </TabsList>

              {/* Donations Tab */}
              <TabsContent value="donations" className="mt-6 space-y-4">
                {donations.length === 0 ? (
                  <Card><CardContent className="p-6 text-center text-muted-foreground">No donations yet.</CardContent></Card>
                ) : (
                  donations.map((d) => (
                    <Card key={d.id} className="border hover:border-primary/50 transition-smooth">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold mb-1">{d.campaigns?.title || "Untitled Campaign"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(d.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">KSh {d.amount?.toLocaleString()}</p>
                          <Badge variant="outline" className="mt-1">{d.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* My Campaigns Tab */}
              <TabsContent value="campaigns" className="mt-6 space-y-4">
                {myCampaigns.length === 0 ? (
                  <Card><CardContent className="p-6 text-center text-muted-foreground">No campaigns yet.</CardContent></Card>
                ) : (
                  myCampaigns.map((c) => (
                    <Card key={c.id} className="border hover:border-primary/50 transition-smooth">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold mb-1">{c.title}</h3>
                            <Badge className="bg-success">{c.status}</Badge>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/campaign/${c.id}`)}>Manage</Button>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            KSh {c.raised_amount?.toLocaleString()} / KSh {c.goal_amount?.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Receipts Tab */}
              <TabsContent value="receipts" className="mt-6">
                <Card className="border-2 border-dashed">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Tax receipts will be available here</p>
                    <Button variant="outline">Download All Receipts</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
