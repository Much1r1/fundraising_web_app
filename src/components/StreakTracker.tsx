import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Star, Heart, Target } from "lucide-react";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  totalDonations: number;
  badges?: string[];
}

const StreakTracker = ({
  currentStreak,
  longestStreak,
  totalDonations,
  badges = [],
}: StreakTrackerProps) => {
  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "starter":
        return <Star className="w-4 h-4" />;
      case "champion":
        return <Trophy className="w-4 h-4" />;
      case "hero":
        return <Heart className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "starter":
        return "bg-secondary text-secondary-foreground";
      case "champion":
        return "bg-warning text-warning-foreground";
      case "hero":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="gradient-primary text-primary-foreground">
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-6 h-6" />
          Donation Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full gradient-primary flex items-center justify-center mb-2 shadow-glow animate-pulse">
              <Flame className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-3xl font-bold text-foreground">{currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-warning/20 flex items-center justify-center mb-2">
              <Trophy className="w-8 h-8 text-warning" />
            </div>
            <div className="text-3xl font-bold text-foreground">{longestStreak}</div>
            <div className="text-sm text-muted-foreground">Best Streak</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-2">
              <Heart className="w-8 h-8 text-success" />
            </div>
            <div className="text-3xl font-bold text-foreground">{totalDonations}</div>
            <div className="text-sm text-muted-foreground">Total Gifts</div>
          </div>
        </div>

        {badges.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase">
              Your Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, i) => (
                <Badge
                  key={i}
                  className={`${getBadgeColor(badge)} gap-1 px-3 py-1`}
                >
                  {getBadgeIcon(badge)}
                  {badge.charAt(0).toUpperCase() + badge.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-sm text-center">
            <span className="font-semibold text-accent">Keep it up!</span> Donate today to maintain your streak 🔥
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
