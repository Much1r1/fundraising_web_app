import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing donation reminders...');

    // Find all reminders that are due
    const { data: reminders, error: fetchError } = await supabase
      .from('donor_reminders')
      .select(`
        *,
        users (id, email, full_name),
        campaigns (id, title)
      `)
      .lte('next_due', new Date().toISOString())
      .eq('enabled', true);

    if (fetchError) {
      console.error('Error fetching reminders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${reminders?.length || 0} due reminders`);

    let processedCount = 0;

    for (const reminder of reminders || []) {
      try {
        // Create in-app notification
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: reminder.user_id,
          type: 'reminder',
          title: 'Donation Reminder',
          message: `Don't forget to donate ${reminder.amount} KES to "${reminder.campaigns?.title}"`,
          metadata: {
            campaign_id: reminder.campaign_id,
            amount: reminder.amount,
            frequency: reminder.frequency,
          },
        });

        if (notifError) {
          console.error('Error creating notification:', notifError);
        }

        // TODO: Send email reminder
        // If you have RESEND_API_KEY configured, you can send email here
        // const emailSent = await sendReminderEmail(reminder.users?.email, reminder);

        // Calculate next due date based on frequency
        const nextDue = calculateNextDue(reminder.frequency);

        // Update reminder with next due date
        const { error: updateError } = await supabase
          .from('donor_reminders')
          .update({ next_due: nextDue })
          .eq('id', reminder.id);

        if (updateError) {
          console.error('Error updating reminder:', updateError);
        } else {
          processedCount++;
          console.log(`Processed reminder ${reminder.id}, next due: ${nextDue}`);
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        total: reminders?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

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

// Optional: Email sending function using Resend
// Uncomment and configure if RESEND_API_KEY is available
/*
async function sendReminderEmail(email: string, reminder: any) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.log('RESEND_API_KEY not configured, skipping email');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Donations <reminders@yourdomain.com>',
        to: [email],
        subject: 'Donation Reminder',
        html: `
          <h2>Don't forget your donation!</h2>
          <p>This is a friendly reminder to donate ${reminder.amount} KES to "${reminder.campaigns?.title}".</p>
          <p><a href="https://yourapp.com/campaigns/${reminder.campaign_id}">Make your donation now</a></p>
        `,
      }),
    });

    if (response.ok) {
      console.log('Reminder email sent to:', email);
      return true;
    } else {
      console.error('Failed to send email:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
*/
