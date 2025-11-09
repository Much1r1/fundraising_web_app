# Backend Integration Guide for Profile Features

This document outlines the backend integration steps needed to fully activate the enhanced Profile page features.

## Table of Contents
1. [Payment Methods Integration](#payment-methods-integration)
2. [Recurring Donations](#recurring-donations)
3. [Donation Reminders](#donation-reminders)
4. [Environment Variables](#environment-variables)

---

## 1. Payment Methods Integration

### Stripe Integration

#### Required Secrets
Add these secrets in Supabase Dashboard → Project Settings → Edge Functions:
- `STRIPE_SECRET_KEY` - Your Stripe secret key (already exists)
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

#### Create Stripe Checkout Session Edge Function

Create `supabase/functions/create-stripe-session/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode = "setup" } = await req.json(); // mode can be 'setup' or 'payment'

    const session = await stripe.checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      success_url: `${req.headers.get("origin")}/profile?payment=success`,
      cancel_url: `${req.headers.get("origin")}/profile?payment=cancelled`,
      ...(mode === "setup" && {
        setup_intent_data: {
          metadata: { type: "payment_method_setup" },
        },
      }),
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

#### Handle Stripe Webhooks

Create `supabase/functions/stripe-webhook/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") as string
    );

    switch (event.type) {
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Get subscription details
        const { data: subscription } = await supabase
          .from("recurring_subscriptions")
          .select("*")
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (subscription) {
          // Create donation record
          await supabase.from("donations").insert({
            donor_id: subscription.user_id,
            campaign_id: subscription.campaign_id,
            amount: subscription.amount,
            payment_method: "card",
            payment_status: "completed",
            payment_reference: invoice.id,
            is_anonymous: false,
          });

          // Update campaign amount
          if (subscription.campaign_id) {
            await supabase.rpc("increment_campaign_amount", {
              campaign_id: subscription.campaign_id,
              amount_to_add: subscription.amount,
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Deactivate recurring subscription
        await supabase
          .from("recurring_subscriptions")
          .update({ active: false })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### PayPal Integration

#### Required Secrets
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

#### Frontend Integration (add to Profile.tsx)

```typescript
// Add PayPal script to head
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&vault=true";
  script.async = true;
  document.body.appendChild(script);
  
  script.onload = () => {
    // Initialize PayPal buttons
    (window as any).paypal.Buttons({
      createOrder: async () => {
        // Call your edge function to create PayPal order
        const response = await fetch("/functions/v1/create-paypal-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        return data.orderId;
      },
      onApprove: async (data: any) => {
        // Capture payment
        await fetch("/functions/v1/capture-paypal-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID }),
        });
      },
    }).render("#paypal-button-container");
  };
}, []);
```

### Google Pay Integration

#### Frontend Implementation (add to Profile.tsx)

```typescript
const initializeGooglePay = async () => {
  if (!window.google) return;

  const paymentsClient = new google.payments.api.PaymentsClient({
    environment: "TEST", // or "PRODUCTION"
  });

  const paymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: ["MASTERCARD", "VISA"],
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "stripe",
            "stripe:version": "2018-10-31",
            "stripe:publishableKey": "YOUR_STRIPE_PUBLISHABLE_KEY",
          },
        },
      },
    ],
    merchantInfo: {
      merchantId: "YOUR_GOOGLE_PAY_MERCHANT_ID",
      merchantName: "Your Campaign Platform",
    },
    transactionInfo: {
      totalPriceStatus: "NOT_CURRENTLY_KNOWN",
      currencyCode: "KES",
    },
  };

  const button = paymentsClient.createButton({
    onClick: async () => {
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      // Send payment token to backend
      console.log("Payment token:", paymentData);
    },
  });

  document.getElementById("google-pay-button")?.appendChild(button);
};
```

---

## 2. Recurring Donations

### Stripe Subscriptions

#### Create Stripe Subscription Edge Function

Create `supabase/functions/create-recurring-donation/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscriptionId, paymentMethodId } = await req.json();

    // Get subscription from database
    const { data: subscription } = await supabase
      .from("recurring_subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Create or get Stripe customer
    const { data: userData } = await supabase.auth.getUser(req.headers.get("authorization")!.replace("Bearer ", ""));
    const customer = await stripe.customers.create({
      email: userData.user?.email,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Create price
    const price = await stripe.prices.create({
      unit_amount: Math.round(Number(subscription.amount) * 100), // Convert to cents
      currency: "kes",
      recurring: {
        interval: subscription.frequency === "yearly" ? "year" :
                  subscription.frequency === "monthly" ? "month" :
                  subscription.frequency === "weekly" ? "week" : "day",
      },
      product_data: { name: "Recurring Donation" },
    });

    // Create subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      expand: ["latest_invoice.payment_intent"],
    });

    // Update database with Stripe subscription ID
    await supabase
      .from("recurring_subscriptions")
      .update({ 
        stripe_subscription_id: stripeSubscription.id,
        payment_method: "card",
        active: true,
      })
      .eq("id", subscriptionId);

    return new Response(
      JSON.stringify({ success: true, subscriptionId: stripeSubscription.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## 3. Donation Reminders

### Scheduled Reminder Worker

#### Option A: Supabase Scheduled Functions

Enable `pg_cron` extension in Supabase SQL Editor:

```sql
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create scheduled job to process reminders every hour
SELECT cron.schedule(
  'process-donation-reminders',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

#### Create Reminder Processing Edge Function

Create `supabase/functions/process-reminders/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") as string,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
);

serve(async (req) => {
  try {
    // Get reminders that are due
    const { data: dueReminders, error } = await supabase
      .from("donor_reminders")
      .select("*")
      .eq("enabled", true)
      .lte("next_due", new Date().toISOString());

    if (error) throw error;

    for (const reminder of dueReminders || []) {
      // Send notification
      if (reminder.in_app_enabled) {
        await supabase.from("notifications").insert({
          user_id: reminder.user_id,
          campaign_id: reminder.campaign_id,
          type: "reminder",
          title: "Donation Reminder",
          message: `Time to make your ${reminder.frequency} donation of KSh ${reminder.amount}`,
          metadata: { reminder_id: reminder.id },
        });
      }

      // Send email if enabled (use Resend or SendGrid)
      if (reminder.email_enabled) {
        // TODO: Integrate with your email provider
        // await sendEmail(...)
      }

      // Calculate next due date
      const nextDue = new Date(reminder.next_due);
      switch (reminder.frequency) {
        case "daily": nextDue.setDate(nextDue.getDate() + 1); break;
        case "weekly": nextDue.setDate(nextDue.getDate() + 7); break;
        case "monthly": nextDue.setMonth(nextDue.getMonth() + 1); break;
        case "yearly": nextDue.setFullYear(nextDue.getFullYear() + 1); break;
      }

      // Update next_due
      await supabase
        .from("donor_reminders")
        .update({ next_due: nextDue.toISOString() })
        .eq("id", reminder.id);
    }

    return new Response(
      JSON.stringify({ processed: dueReminders?.length || 0 }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

---

## 4. Environment Variables

### Required Secrets in Supabase

Add these in **Supabase Dashboard → Project Settings → Edge Functions**:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Google Pay
GOOGLE_PAY_MERCHANT_ID=...

# Email (if using Resend)
RESEND_API_KEY=re_...
```

---

## 5. Frontend Updates Needed

### Update Profile.tsx Payment Methods Section

Replace the disabled buttons with active implementations:

```typescript
// Add Google Pay button
<Button 
  variant="outline" 
  className="w-full justify-start gap-2"
  onClick={() => initializeGooglePay()}
>
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm7.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0z"/>
  </svg>
  Google Pay
</Button>

// Add Card button - redirect to Stripe Checkout
<Button 
  variant="outline" 
  className="w-full justify-start gap-2"
  onClick={async () => {
    const { data } = await supabase.functions.invoke("create-stripe-session", {
      body: { mode: "setup" }
    });
    if (data?.url) window.location.href = data.url;
  }}
>
  <CreditCard className="w-4 h-4" />
  Add Credit/Debit Card (Stripe)
</Button>
```

---

## Testing Checklist

- [ ] Test Stripe card addition flow
- [ ] Test PayPal connection
- [ ] Test Google Pay integration
- [ ] Test creating recurring donation
- [ ] Test cancelling recurring donation
- [ ] Verify webhook handling for successful payments
- [ ] Test reminder notifications (in-app and email)
- [ ] Verify anonymous donation toggle
- [ ] Test password change functionality
- [ ] Test logout flow

---

## Production Deployment

1. Switch all API keys from test to production mode
2. Update webhook URLs in Stripe/PayPal dashboards
3. Enable email provider (Resend/SendGrid) for production
4. Set up monitoring for failed payments
5. Configure backup cron service if not using Supabase pg_cron
6. Test end-to-end flows in production environment

---

For questions or issues, refer to:
- Stripe Docs: https://stripe.com/docs
- PayPal Docs: https://developer.paypal.com/docs
- Supabase Docs: https://supabase.com/docs
