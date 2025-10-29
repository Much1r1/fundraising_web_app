import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { conversation_id, message } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search FAQs for matching answer
    const { data: faqs } = await supabase
      .from("chat_faq")
      .select("*")
      .eq("is_active", true);

    let responseMessage = "";

    // Simple keyword matching for FAQs
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("create") && lowerMessage.includes("fundraiser")) {
      const faq = faqs?.find(f => f.question.toLowerCase().includes("create"));
      responseMessage = faq?.answer || "To create a fundraiser, click on 'Create Campaign' in the navigation menu and fill out the required details including title, goal amount, and description.";
    } else if (lowerMessage.includes("donate") || lowerMessage.includes("donation")) {
      const faq = faqs?.find(f => f.question.toLowerCase().includes("donate"));
      responseMessage = faq?.answer || "To donate, visit any campaign page and click the 'Donate Now' button. You can donate via M-Pesa, PayPal, or credit card.";
    } else if (lowerMessage.includes("withdraw") || lowerMessage.includes("payout")) {
      const faq = faqs?.find(f => f.question.toLowerCase().includes("withdraw"));
      responseMessage = faq?.answer || "Withdrawals can be requested from your campaign dashboard once your campaign reaches its minimum payout threshold. Funds are typically processed within 3-5 business days.";
    } else if (lowerMessage.includes("verify") || lowerMessage.includes("verification")) {
      const faq = faqs?.find(f => f.question.toLowerCase().includes("verify"));
      responseMessage = faq?.answer || "To verify your account, go to your profile settings and complete the verification process by uploading required documents. Verified accounts have higher withdrawal limits.";
    } else if (lowerMessage.includes("fee") || lowerMessage.includes("charge") || lowerMessage.includes("cost")) {
      const faq = faqs?.find(f => f.question.toLowerCase().includes("fee"));
      responseMessage = faq?.answer || "Our platform charges a 5% fee on successful donations plus payment processing fees. There are no upfront costs to create a campaign.";
    } else if (lowerMessage.includes("secure") || lowerMessage.includes("safe") || lowerMessage.includes("security")) {
      const faq = faqs?.find(f => f.question.toLowerCase().includes("secure"));
      responseMessage = faq?.answer || "Yes, all payments are processed through secure, PCI-compliant payment gateways. We use bank-level encryption to protect your data.";
    } else if (lowerMessage.includes("check") && lowerMessage.includes("donation")) {
      responseMessage = "You can check your donation status by visiting your Profile page and clicking on the 'Donations' tab. You can also use your transaction ID to track the donation.";
    } else if (lowerMessage.includes("contact") || lowerMessage.includes("admin") || lowerMessage.includes("support")) {
      responseMessage = "I'll connect you with our support team. You can also email us directly at muchirielvis375@gmail.com. An admin will respond within 24 hours.";
      
      // Mark conversation for admin attention
      await supabase
        .from("chat_conversations")
        .update({ status: "pending_admin" })
        .eq("id", conversation_id);
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      responseMessage = "Hello! 👋 How can I assist you with your fundraising today? You can ask me about creating campaigns, making donations, or any other questions you have.";
    } else if (lowerMessage.includes("thank")) {
      responseMessage = "You're welcome! Is there anything else I can help you with?";
    } else {
      // Default response if no match found
      responseMessage = "I'm here to help! I can assist you with:\n\n• Creating a fundraiser\n• Making donations\n• Checking donation status\n• Account verification\n• Withdrawals and payouts\n• Platform fees\n• Security questions\n\nWhat would you like to know more about? If you need specific assistance, I can connect you with our admin team.";
    }

    // Check if message needs milestones/notifications
    if (lowerMessage.includes("status") || lowerMessage.includes("progress")) {
      // This could trigger a check for campaign milestones
      responseMessage += "\n\n💡 Tip: You can view your campaign progress and milestones in your campaign dashboard!";
    }

    // Insert bot response
    await supabase.from("chat_messages").insert({
      conversation_id,
      message: responseMessage,
      sender_type: "bot",
      is_read: false,
    });

    return new Response(
      JSON.stringify({ success: true, message: responseMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
