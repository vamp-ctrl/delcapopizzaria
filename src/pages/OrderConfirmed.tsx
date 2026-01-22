import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const OrderConfirmed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    if (orderId) {
      // Get last 6 chars of order ID as order number
      setOrderNumber(orderId.slice(-6).toUpperCase());
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 mx-auto bg-accent/20 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-accent" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Pedido Confirmado!
          </h1>
          <p className="text-muted-foreground">
            Seu pagamento foi aprovado com sucesso.
          </p>
        </div>

        {orderNumber && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground">Número do pedido</p>
            <p className="text-2xl font-bold font-mono text-primary">#{orderNumber}</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-muted flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary" />
          <div className="text-left">
            <p className="font-medium">Tempo estimado</p>
            <p className="text-sm text-muted-foreground">40-60 minutos</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Você receberá atualizações sobre o status do seu pedido.
        </p>

        <Button onClick={() => navigate('/')} className="w-full" size="lg">
          <Home className="w-5 h-5 mr-2" />
          Voltar ao início
        </Button>
      </motion.div>
    </div>
  );
};

export default OrderConfirmed;
