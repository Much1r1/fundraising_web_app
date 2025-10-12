import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, ...payload } = await req.json();

    if (action === 'initiate') {
      // Get OAuth token
      const consumerKey = Deno.env.get('MPESA_CONSUMER_KEY')!;
      const consumerSecret = Deno.env.get('MPESA_CONSUMER_SECRET')!;
      const auth = btoa(`${consumerKey}:${consumerSecret}`);

      console.log('Getting M-Pesa OAuth token...');
      const tokenResponse = await fetch(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
          },
        }
      );

      const tokenData = await tokenResponse.json();
      console.log('Token response:', tokenData);

      if (!tokenData.access_token) {
        throw new Error('Failed to get M-Pesa access token');
      }

      // Initiate STK Push
      const { phoneNumber, amount, campaignId, donorId, accountReference } = payload;
      const shortCode = Deno.env.get('MPESA_SHORTCODE')!;
      const passkey = Deno.env.get('MPESA_PASSKEY')!;
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const password = btoa(`${shortCode}${passkey}${timestamp}`);

      const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-payment`;

      console.log('Initiating STK Push...');
      const stkResponse = await fetch(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: phoneNumber,
            PartyB: shortCode,
            PhoneNumber: phoneNumber,
            CallBackURL: callbackUrl,
            AccountReference: accountReference || campaignId,
            TransactionDesc: `Donation to campaign ${campaignId}`,
          }),
        }
      );

      const stkData = await stkResponse.json();
      console.log('STK Push response:', stkData);

      if (stkData.ResponseCode === '0') {
        // Create pending donation record
        const { data: donation, error: donationError } = await supabase
          .from('donations')
          .insert({
            campaign_id: campaignId,
            donor_id: donorId,
            amount: amount,
            payment_method: 'mpesa',
            payment_status: 'pending',
            payment_reference: stkData.CheckoutRequestID,
          })
          .select()
          .single();

        if (donationError) {
          console.error('Error creating donation:', donationError);
          throw donationError;
        }

        return new Response(
          JSON.stringify({
            success: true,
            checkoutRequestId: stkData.CheckoutRequestID,
            donationId: donation.id,
            message: 'Please enter your M-Pesa PIN on your phone',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(stkData.ResponseDescription || 'STK Push failed');
      }
    } else if (action === 'callback') {
      // Handle M-Pesa callback
      console.log('Received M-Pesa callback:', JSON.stringify(payload, null, 2));

      const { Body } = payload;
      const stkCallback = Body?.stkCallback;

      if (!stkCallback) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const checkoutRequestId = stkCallback.CheckoutRequestID;
      const resultCode = stkCallback.ResultCode;

      // Find the donation by payment reference
      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .eq('payment_reference', checkoutRequestId)
        .single();

      if (!donations) {
        console.error('Donation not found for checkout request:', checkoutRequestId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update donation status
      const newStatus = resultCode === 0 ? 'completed' : 'failed';
      
      const { error: updateError } = await supabase
        .from('donations')
        .update({ payment_status: newStatus })
        .eq('id', donations.id);

      if (updateError) {
        console.error('Error updating donation:', updateError);
      }

      // If successful, update campaign current_amount
      if (resultCode === 0) {
        const { error: campaignError } = await supabase.rpc('increment_campaign_amount', {
          campaign_id: donations.campaign_id,
          amount_to_add: donations.amount,
        });

        if (campaignError) {
          console.error('Error updating campaign amount:', campaignError);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in mpesa-payment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
