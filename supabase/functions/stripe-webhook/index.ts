import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Webhook event received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { userId, campaignId, isAnonymous, frequency, enableReminders } = session.metadata || {};

  if (session.mode === 'payment' && campaignId) {
    // One-time payment - create donation record
    const { error } = await supabase.from('donations').insert({
      donor_id: userId,
      campaign_id: campaignId,
      amount: (session.amount_total || 0) / 100,
      payment_method: 'stripe',
      is_anonymous: isAnonymous === 'true',
      stripe_payment_id: session.payment_intent as string,
    });

    if (error) {
      console.error('Error creating donation:', error);
    } else {
      console.log('Donation created for session:', session.id);
    }
  } else if (session.mode === 'subscription') {
    // Subscription created - store in recurring_subscriptions
    const { error } = await supabase.from('recurring_subscriptions').insert({
      user_id: userId,
      campaign_id: campaignId,
      amount: (session.amount_total || 0) / 100,
      frequency: frequency || 'monthly',
      stripe_subscription_id: session.subscription as string,
      active: true,
    });

    if (error) {
      console.error('Error creating subscription:', error);
    } else {
      console.log('Subscription created for session:', session.id);

      // Create reminder if requested
      if (enableReminders === 'true') {
        await createReminder(userId, campaignId, (session.amount_total || 0) / 100, frequency || 'monthly');
      }
    }
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  // Find the subscription in our database
  const { data: subscription } = await supabase
    .from('recurring_subscriptions')
    .select('*')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (subscription) {
    // Create donation record for this recurring payment
    const { error } = await supabase.from('donations').insert({
      donor_id: subscription.user_id,
      campaign_id: subscription.campaign_id,
      amount: (invoice.amount_paid || 0) / 100,
      payment_method: 'stripe_subscription',
      is_anonymous: false,
      stripe_payment_id: invoice.payment_intent as string,
    });

    if (error) {
      console.error('Error creating recurring donation:', error);
    } else {
      console.log('Recurring donation created for invoice:', invoice.id);
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Mark subscription as inactive
  const { error } = await supabase
    .from('recurring_subscriptions')
    .update({ active: false })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error deactivating subscription:', error);
  } else {
    console.log('Subscription deactivated:', subscription.id);
  }
}

async function createReminder(userId: string, campaignId: string, amount: number, frequency: string) {
  const nextDue = calculateNextDue(frequency);

  const { error } = await supabase.from('donor_reminders').insert({
    user_id: userId,
    campaign_id: campaignId,
    amount,
    frequency,
    next_due: nextDue,
    enabled: true,
  });

  if (error) {
    console.error('Error creating reminder:', error);
  }
}

function calculateNextDue(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case 'monthly':
    default:
      now.setMonth(now.getMonth() + 1);
      break;
  }
  return now.toISOString();
}
