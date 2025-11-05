import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Lightbulb, Share2, TrendingUp, CheckCircle2, Users, Heart } from "lucide-react";

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How It <span className="text-primary">Works</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start your fundraising journey in three simple steps. From creating your campaign to reaching your goals, we're with you every step of the way.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">1. Create Your Campaign</h3>
                <p className="text-muted-foreground mb-4">
                  Share your story, set your funding goal, and add compelling images. Our easy-to-use platform guides you through every step.
                </p>
                <ul className="text-left space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Tell your story authentically</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Set realistic funding goals</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Add photos and videos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Share2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">2. Share & Engage</h3>
                <p className="text-muted-foreground mb-4">
                  Spread the word through social media, email, and word of mouth. Engage with your supporters and build momentum.
                </p>
                <ul className="text-left space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Share on social platforms</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Update your supporters regularly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Respond to comments and questions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">3. Track & Achieve</h3>
                <p className="text-muted-foreground mb-4">
                  Monitor your progress in real-time, celebrate milestones, and watch your community come together to support your cause.
                </p>
                <ul className="text-left space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Real-time donation tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Detailed analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Secure fund withdrawal</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Trusted Community</h3>
                <p className="text-muted-foreground">
                  Join thousands of campaign creators and donors who trust our platform for secure, transparent fundraising.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Low Fees</h3>
                <p className="text-muted-foreground">
                  Keep more of what you raise with our competitive fee structure. We believe in maximizing impact, not profits.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Verified & Secure</h3>
                <p className="text-muted-foreground">
                  All campaigns are verified, and we use industry-leading security measures to protect your data and donations.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Proven Success</h3>
                <p className="text-muted-foreground">
                  Our platform has helped raise millions for worthy causes, with an 85% success rate for active campaigns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create your campaign today and start making a difference in your community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/campaigns/create")}>
              Start Your Campaign
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/campaigns")}>
              Browse Campaigns
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
