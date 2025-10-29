-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'blocked')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'assistant', 'admin')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_faq table
CREATE TABLE IF NOT EXISTS public.chat_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_faq ENABLE ROW LEVEL SECURITY;

-- Policies for chat_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.chat_conversations FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create conversations"
  ON public.chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.chat_conversations FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete conversations"
  ON public.chat_conversations FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Policies for chat_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = conversation_id
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations
      WHERE id = conversation_id
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Admins can update messages"
  ON public.chat_messages FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete messages"
  ON public.chat_messages FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Policies for chat_faq
CREATE POLICY "Everyone can view active FAQs"
  ON public.chat_faq FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage FAQs"
  ON public.chat_faq FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_status ON public.chat_conversations(status);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_chat_faq_category ON public.chat_faq(category);

-- Insert default FAQs
INSERT INTO public.chat_faq (question, answer, category, priority) VALUES
('How do I create a fundraiser?', 'To create a fundraiser: 1) Click "Start a Campaign" in the navigation menu 2) Fill in your campaign details including title, description, and goal amount 3) Upload a compelling image 4) Set your fundraising duration 5) Submit for review. Your campaign will be live once approved!', 'fundraiser', 10),
('How can I donate to a campaign?', 'Donating is easy! 1) Browse campaigns and select one you want to support 2) Click "Donate Now" 3) Enter your donation amount 4) Choose your payment method (M-Pesa, Card, or PayPal) 5) Complete the payment. You''ll receive a confirmation email with your receipt.', 'donation', 10),
('How do withdrawals work?', 'To withdraw funds: 1) Go to your campaign dashboard 2) Click "Request Withdrawal" 3) Enter the amount you want to withdraw 4) Provide your bank details or M-Pesa number 5) Submit the request. Withdrawals are processed within 3-5 business days after verification.', 'fundraiser', 9),
('How do I verify my account?', 'Account verification helps build trust: 1) Go to your Profile 2) Click "Verify Account" 3) Upload a government-issued ID 4) Upload proof of address (utility bill or bank statement) 5) Submit for review. Verification typically takes 24-48 hours.', 'account', 8),
('What are the platform fees?', 'FundHope charges a small platform fee of 5% on successful donations to keep the platform running. Payment processing fees (2.9% + KSh 30 per transaction) also apply. There are no setup fees or subscription charges.', 'general', 10),
('Is my payment secure?', 'Absolutely! We use industry-standard encryption and work with trusted payment processors (Stripe, PayPal, M-Pesa). Your financial information is never stored on our servers. All transactions are PCI-DSS compliant.', 'donation', 9),
('How do I contact support?', 'You can reach our support team by: 1) Using this chat (I can escalate to a human agent) 2) Emailing muchirielvis375@gmail.com 3) Through your account dashboard. We typically respond within 24 hours on business days.', 'general', 7),
('Can I edit my campaign after publishing?', 'Yes! You can edit your campaign details, update images, and post updates at any time from your campaign dashboard. However, you cannot change the fundraising goal once donations have been received.', 'fundraiser', 6),
('How long does it take to receive donations?', 'Donations are instant! Donors see the campaign update immediately. However, for withdrawal to your account, please allow 3-5 business days for processing and verification.', 'fundraiser', 7),
('Can I get a refund on my donation?', 'Refund requests are handled on a case-by-case basis. Please contact our support team at muchirielvis375@gmail.com with your transaction ID and reason for the refund request. We typically process refund requests within 7-10 business days.', 'donation', 6);

-- Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating conversation timestamp
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;