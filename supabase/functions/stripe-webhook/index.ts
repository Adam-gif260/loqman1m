import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Map Stripe price amounts (in cents) to credit amounts
const PRICE_TO_CREDITS: Record<number, { credits: number; plan: string }> = {
  1600: { credits: 100, plan: 'starter' },   // 16€
  3000: { credits: 300, plan: 'pro' },        // 30€
  7500: { credits: 1000, plan: 'business' },  // 75€
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      console.error('Missing Stripe configuration');
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No stripe-signature header');
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify Stripe webhook signature manually (crypto-based)
    const encoder = new TextEncoder();
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      console.error('Invalid signature format');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const timestamp = timestampPart.split('=')[1];
    const expectedSig = signaturePart.split('=')[1];
    const signedPayload = `${timestamp}.${body}`;

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(STRIPE_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const computedSig = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (computedSig !== expectedSig) {
      console.error('Signature mismatch');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const event = JSON.parse(body);
    console.log('Stripe event received:', event.type);

    // Use service role to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const customerEmail = session.customer_details?.email || session.customer_email;
      const amountTotal = session.amount_total; // in cents

      console.log('Checkout completed:', { customerEmail, amountTotal });

      if (!customerEmail) {
        console.error('No customer email found in session');
        return new Response(JSON.stringify({ error: 'No email' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find credits for this amount
      const creditInfo = PRICE_TO_CREDITS[amountTotal];
      if (!creditInfo) {
        console.error('Unknown amount:', amountTotal);
        return new Response(JSON.stringify({ error: 'Unknown amount' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find user by email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.error('Error listing users:', authError);
        return new Response(JSON.stringify({ error: 'Auth error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const user = authUsers.users.find(
        (u: any) => u.email?.toLowerCase() === customerEmail.toLowerCase()
      );

      if (!user) {
        console.error('User not found for email:', customerEmail);
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Found user:', user.id, 'Adding', creditInfo.credits, 'credits');

      // Update profile: add credits and set subscription plan
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (profileFetchError) {
        console.error('Error fetching profile:', profileFetchError);
        return new Response(JSON.stringify({ error: 'Profile fetch error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const newCredits = (profile?.credits || 0) + creditInfo.credits;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          credits: newCredits,
          subscription_plan: creditInfo.plan,
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return new Response(JSON.stringify({ error: 'Update error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Record the transaction
      const { error: txError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: creditInfo.credits,
          type: 'purchase',
          description: `Abonnement ${creditInfo.plan} - ${creditInfo.credits} crédits`,
        });

      if (txError) {
        console.error('Error recording transaction:', txError);
      }

      console.log('Successfully credited', creditInfo.credits, 'credits to user', user.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
