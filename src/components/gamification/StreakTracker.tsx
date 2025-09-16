import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Calendar, Target } from "lucide-react";
import { motion } from "framer-motion";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  nextMilestone: number;
  totalDonations: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    color: 'gold' | 'silver' | 'bronze';
    earned: boolean;
  }>;
}

export const StreakTracker = ({
  currentStreak,
  longestStreak,
  nextMilestone,
  totalDonations,
  badges,
}: StreakTrackerProps) => {
  const progressToNextMilestone = (currentStreak / nextMilestone) * 100;

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-streak" />
          Donation Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl font-bold text-streak mb-1"
          >
            {currentStreak}
          </motion.div>
          <p className="text-sm text-muted-foreground">Days in a row</p>
        </div>

        {/* Progress to Next Milestone */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Next milestone</span>
            <span className="font-medium">{nextMilestone} days</span>
          </div>
          <Progress value={progressToNextMilestone} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-lg font-semibold">
              <Trophy className="h-4 w-4 text-badge-gold" />
              {longestStreak}
            </div>
            <p className="text-xs text-muted-foreground">Best streak</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-lg font-semibold">
              <Target className="h-4 w-4 text-primary" />
              {totalDonations}
            </div>
            <p className="text-xs text-muted-foreground">Total donations</p>
          </div>
        </div>

        {/* Badges */}
        <div>
          <p className="text-sm font-medium mb-3">Achievements</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.1 }}
                className={`relative ${badge.earned ? 'opacity-100' : 'opacity-30'}`}
              >
                <Badge
                  variant="outline"
                  className={`
                    ${badge.color === 'gold' && 'border-badge-gold text-badge-gold'}
                    ${badge.color === 'silver' && 'border-badge-silver text-badge-silver'}
                    ${badge.color === 'bronze' && 'border-badge-bronze text-badge-bronze'}
                  `}
                >
                  <span className="mr-1">{badge.icon}</span>
                  {badge.name}
                </Badge>
                {badge.earned && (
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Next Donation Reminder */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <Calendar className="h-4 w-4 text-primary" />
          <div className="text-sm">
            <p className="font-medium">Keep it going!</p>
            <p className="text-muted-foreground">Donate today to maintain your streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};