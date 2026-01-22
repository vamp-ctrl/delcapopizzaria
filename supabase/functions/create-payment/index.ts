import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  description: string;
  paymentMethod: 'credit' | 'debit' | 'pix';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    if (!accessToken) {
      throw new Error('Mercado Pago access token not configured');
    }

    const { orderId, amount, customerEmail, customerName, description, paymentMethod }: PaymentRequest = await req.json();

    // Create payment preference for Mercado Pago
    const preferenceData = {
      items: [
        {
          id: orderId,
          title: description,
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: customerEmail,
        name: customerName,
      },
      back_urls: {
        success: `${req.headers.get('origin')}/pedido-confirmado?order_id=${orderId}`,
        failure: `${req.headers.get('origin')}/pagamento-falhou?order_id=${orderId}`,
        pending: `${req.headers.get('origin')}/pagamento-pendente?order_id=${orderId}`,
      },
      auto_return: 'approved',
      external_reference: orderId,
      payment_methods: paymentMethod === 'pix' 
        ? {
            excluded_payment_types: [
              { id: 'credit_card' },
              { id: 'debit_card' },
              { id: 'ticket' },
            ],
          }
        : paymentMethod === 'credit'
        ? {
            excluded_payment_types: [
              { id: 'debit_card' },
              { id: 'ticket' },
              { id: 'bank_transfer' },
            ],
          }
        : {
            excluded_payment_types: [
              { id: 'credit_card' },
              { id: 'ticket' },
              { id: 'bank_transfer' },
            ],
          },
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Mercado Pago error:', errorData);
      throw new Error(`Failed to create payment preference: ${response.status}`);
    }

    const preference = await response.json();

    return new Response(
      JSON.stringify({
        preferenceId: preference.id,
        initPoint: preference.init_point,
        sandboxInitPoint: preference.sandbox_init_point,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment:', error);
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
