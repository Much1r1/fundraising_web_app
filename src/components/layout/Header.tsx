import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, Search, User } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">FundRise</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/campaigns" className="text-sm font-medium hover:text-primary transition-colors">
            Campaigns
          </Link>
          <Link to="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
            Leaderboard
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
        </nav>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Search className="h-4 w-4" />
          </Button>

          <Link to="/create-campaign">
            <Button variant="default" size="sm" className="hidden sm:flex">
              Start Campaign
            </Button>
          </Link>

          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background p-4">
          <nav className="flex flex-col space-y-3">
            <Link to="/campaigns" className="text-sm font-medium hover:text-primary">
              Campaigns
            </Link>
            <Link to="/leaderboard" className="text-sm font-medium hover:text-primary">
              Leaderboard
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
            <Link to="/create-campaign">
              <Button variant="default" size="sm" className="w-full">
                Start Campaign
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};