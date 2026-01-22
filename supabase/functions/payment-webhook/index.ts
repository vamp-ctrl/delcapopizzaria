import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!accessToken) {
      throw new Error('Mercado Pago access token not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the webhook data
    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body));

    // Mercado Pago sends different types of notifications
    if (body.type === 'payment') {
      const paymentId = body.data?.id;

      if (!paymentId) {
        throw new Error('No payment ID in webhook');
      }

      // Fetch payment details from Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        throw new Error(`Failed to fetch payment: ${paymentResponse.status}`);
      }

      const payment = await paymentResponse.json();
      console.log('Payment details:', JSON.stringify(payment));

      const orderId = payment.external_reference;
      const paymentStatus = payment.status;

      // Map Mercado Pago status to our status
      let dbPaymentStatus: 'pending' | 'approved' | 'rejected' | 'refunded';
      let orderStatus: 'pending' | 'confirmed' | 'cancelled';

      switch (paymentStatus) {
        case 'approved':
          dbPaymentStatus = 'approved';
          orderStatus = 'confirmed';
          break;
        case 'rejected':
        case 'cancelled':
          dbPaymentStatus = 'rejected';
          orderStatus = 'cancelled';
          break;
        case 'refunded':
          dbPaymentStatus = 'refunded';
          orderStatus = 'cancelled';
          break;
        default:
          dbPaymentStatus = 'pending';
          orderStatus = 'pending';
      }

      // Update order in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: dbPaymentStatus,
          payment_id: paymentId.toString(),
          status: orderStatus,
          payment_method: payment.payment_type_id === 'credit_card' 
            ? 'credit' 
            : payment.payment_type_id === 'debit_card' 
            ? 'debit' 
            : 'pix',
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        throw new Error(`Failed to update order: ${updateError.message}`);
      }

      console.log(`Order ${orderId} updated with payment status: ${dbPaymentStatus}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
