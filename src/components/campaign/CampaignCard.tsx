import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Share2, Clock, Users, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  donorsCount: number;
  daysLeft: number;
  category: string;
  location: string;
  organizer: {
    name: string;
    avatar: string;
  };
  isVerified?: boolean;
  isTrending?: boolean;
}

export const CampaignCard = ({
  id,
  title,
  description,
  image,
  goal,
  raised,
  donorsCount,
  daysLeft,
  category,
  location,
  organizer,
  isVerified = false,
  isTrending = false,
}: CampaignCardProps) => {
  const progressPercentage = (raised / goal) * 100;
  const formattedGoal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal);
  const formattedRaised = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(raised);

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300">
        <div className="relative">
          <img
            src={image}
            alt={title}
            className="h-48 w-full object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            {isTrending && (
              <Badge className="bg-gradient-donation text-donation-foreground">
                🔥 Trending
              </Badge>
            )}
            {isVerified && (
              <Badge className="bg-success text-success-foreground">
                ✓ Verified
              </Badge>
            )}
          </div>
          <Badge className="absolute top-2 right-2 bg-background/90 text-foreground">
            {category}
          </Badge>
        </div>

        <CardContent className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={organizer.avatar} alt={organizer.name} />
              <AvatarFallback>{organizer.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{organizer.name}</span>
          </div>

          <Link to={`/campaign/${id}`}>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {description}
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{formattedRaised}</span>
                <span className="text-muted-foreground">of {formattedGoal}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{donorsCount} donors</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{daysLeft} days left</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button className="flex-1" size="sm">
            <Heart className="h-4 w-4 mr-1" />
            Donate
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};