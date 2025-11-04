import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Share2, MapPin, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  goalAmount: number;
  currentAmount: number;
  category: string;
  location?: string;
  daysLeft?: number;
  donorCount?: number;
  isTrending?: boolean;
  isVerified?: boolean;
  organizer?: string;
}

const CampaignCard = ({
  id,
  title,
  description,
  imageUrl,
  goalAmount,
  currentAmount,
  category,
  location,
  daysLeft,
  donorCount = 0,
  isTrending = false,
  isVerified = false,
  organizer,
}: CampaignCardProps) => {
  const progress = (currentAmount / goalAmount) * 100;
  const progressColor = progress >= 75 ? "gradient-success" : "gradient-primary";

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-smooth border-2 hover:border-primary/20 animate-scale-in">
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center gradient-primary">
            <Heart className="w-16 h-16 text-primary-foreground/30" />
          </div>
        )}
        
        {isTrending && (
          <Badge className="absolute top-3 left-3 bg-accent shadow-accent gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending
          </Badge>
        )}
        
        {isVerified && (
          <Badge className="absolute top-3 right-3 bg-success">
            Verified
          </Badge>
        )}

        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
          <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
          {location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {location}
            </span>
          )}
        </div>

        <Link to={`/campaigns/${id}`}>
          <h3 className="text-xl font-bold mb-2 hover:text-primary transition-smooth line-clamp-2">
            {title}
          </h3>
        </Link>
        
        {organizer && (
          <p className="text-xs text-muted-foreground mb-2">
            by {organizer}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>

        <div className="space-y-3">
          <div className="relative">
            <Progress value={progress} className="h-2" />
            <div className="absolute inset-0 h-2 rounded-full overflow-hidden opacity-80">
              <div className={`h-full ${progressColor}`} style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-bold text-lg text-foreground">
                KSh {currentAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                raised of KSh {goalAmount.toLocaleString()}
              </p>
            </div>
            {daysLeft !== undefined && (
              <div className="text-right">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {daysLeft}
                </p>
                <p className="text-xs text-muted-foreground">days left</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {donorCount} {donorCount === 1 ? 'supporter' : 'supporters'}
            </span>
            <span className="text-sm font-semibold text-primary">
              {Math.round(progress)}% funded
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Link to={`/campaigns/${id}`} className="w-full">
          <Button className="w-full" variant="accent">
            Donate Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
