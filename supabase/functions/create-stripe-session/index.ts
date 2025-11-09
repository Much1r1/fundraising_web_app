import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const { type, userId, amount, metadata } = await req.json();

    let session;

    if (type === 'setup') {
      // Setup session for adding payment method
      session = await stripe.checkout.sessions.create({
        mode: 'setup',
        payment_method_types: ['card'],
        success_url: `${req.headers.get('origin')}/profile?setup=success`,
        cancel_url: `${req.headers.get('origin')}/profile?setup=cancel`,
        customer_email: metadata?.email,
        metadata: { userId },
      });
    } else if (type === 'payment') {
      // Payment session for one-time donation
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'kes',
            product_data: {
              name: metadata?.campaignTitle || 'Donation',
              description: metadata?.description,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        }],
        success_url: `${req.headers.get('origin')}/campaigns/${metadata?.campaignId}?payment=success`,
        cancel_url: `${req.headers.get('origin')}/campaigns/${metadata?.campaignId}?payment=cancel`,
        metadata: {
          userId,
          campaignId: metadata?.campaignId,
          isAnonymous: metadata?.isAnonymous || 'false',
        },
      });
    } else if (type === 'subscription') {
      // Subscription session for recurring donations
      const priceId = await createOrGetRecurringPrice(stripe, amount, metadata?.frequency || 'monthly');
      
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url: `${req.headers.get('origin')}/profile?subscription=success`,
        cancel_url: `${req.headers.get('origin')}/profile?subscription=cancel`,
        metadata: {
          userId,
          campaignId: metadata?.campaignId,
          frequency: metadata?.frequency,
          enableReminders: metadata?.enableReminders || 'false',
        },
      });
    }

    console.log('Stripe session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function createOrGetRecurringPrice(stripe: Stripe, amount: number, frequency: string) {
  const interval = frequency === 'yearly' ? 'year' : 
                   frequency === 'weekly' ? 'week' : 
                   frequency === 'daily' ? 'day' : 'month';

  // Create a product for donations if it doesn't exist
  const products = await stripe.products.list({ limit: 1, active: true });
  let product = products.data.find(p => p.metadata.type === 'donation');
  
  if (!product) {
    product = await stripe.products.create({
      name: 'Recurring Donation',
      metadata: { type: 'donation' },
    });
  }

  // Create price for this specific amount and frequency
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(amount * 100),
    currency: 'kes',
    recurring: { interval },
    metadata: { frequency, amount: amount.toString() },
  });

  return price.id;
}
