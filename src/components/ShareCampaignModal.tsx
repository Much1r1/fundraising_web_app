// src/components/ShareCampaignModal.tsx
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Clipboard, MessageCircle, Twitter } from "lucide-react";

interface Campaign {
  title: string;
  description?: string;
  link: string;
  category?: string;
  progress?: number;
}

interface ShareCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
}

const ShareCampaignModal: React.FC<ShareCampaignModalProps> = ({
  isOpen,
  onClose,
  campaign,
}) => {
  const templates = [
    {
      id: "default",
      title: "Default Message",
      template: (c: Campaign) =>
        `Hey! I'm supporting "${c.title}" on FundRaise. ${
          c.description || ""
        } Join me in helping out here: ${c.link}`,
    },
    {
      id: "church",
      title: "Church Fundraiser",
      template: (c: Campaign) =>
        `🙏 Help us reach our goal for "${c.title}"! Every bit counts. Support us here: ${c.link}`,
    },
    {
      id: "youth",
      title: "Youth Project",
      template: (c: Campaign) =>
        `Hey 👋 We're raising funds for "${c.title}" — a youth-led project making a difference. Donate now: ${c.link}`,
    },
  ];

  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [customMessage, setCustomMessage] = useState("");

  // Dynamically update message preview when template changes
  const message = useMemo(() => {
    const template = templates.find((t) => t.id === selectedTemplate);
    return customMessage || template?.template(campaign) || "";
  }, [selectedTemplate, customMessage, campaign]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    alert("Message copied to clipboard!");
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Campaign</DialogTitle>
          <DialogDescription>
            Personalize your message before sharing it with others.
          </DialogDescription>
        </DialogHeader>

        {/* Template Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            Choose Template
          </label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select message style" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message Box */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Your Message
          </label>
          <Textarea
            value={message}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="min-h-[120px]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            <Clipboard className="w-4 h-4" /> Copy
          </Button>
          <Button variant="outline" onClick={shareToTwitter} className="gap-2">
            <Twitter className="w-4 h-4" /> X
          </Button>
          <Button onClick={shareToWhatsApp} className="gap-2">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCampaignModal;
