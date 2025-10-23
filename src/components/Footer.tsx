import { Link } from "react-router-dom";
import { Heart, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FundRise
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              Empowering communities through compassionate giving and transparent fundraising.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/campaigns" className="text-muted-foreground hover:text-primary transition-smooth">Browse Campaigns</Link></li>
              <li><Link to="/create-campaign" className="text-muted-foreground hover:text-primary transition-smooth">Start a Campaign</Link></li>
              <li><Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-smooth">How It Works</Link></li>
              <li><Link to="/success-stories" className="text-muted-foreground hover:text-primary transition-smooth">Success Stories</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-smooth">Help Center</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-smooth">Blog</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-primary transition-smooth">Pricing</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-smooth">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-smooth">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-primary transition-smooth">Cookie Policy</Link></li>
              <li><Link to="/trust-safety" className="text-muted-foreground hover:text-primary transition-smooth">Trust & Safety</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FundHope. All rights reserved. </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
