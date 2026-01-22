import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const orderNumber = orderId ? orderId.slice(-6).toUpperCase() : '';

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
          className="w-24 h-24 mx-auto bg-secondary/20 rounded-full flex items-center justify-center"
        >
          <Clock className="w-12 h-12 text-secondary" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Pagamento Pendente
          </h1>
          <p className="text-muted-foreground">
            Estamos aguardando a confirmação do seu pagamento.
          </p>
        </div>

        {orderNumber && (
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm text-muted-foreground">Número do pedido</p>
            <p className="text-2xl font-bold font-mono text-primary">#{orderNumber}</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-muted text-left">
          <p className="font-medium mb-2">O que acontece agora?</p>
          <p className="text-sm text-muted-foreground">
            Assim que o pagamento for confirmado, seu pedido será processado automaticamente. 
            Você receberá uma notificação quando isso acontecer.
          </p>
        </div>

        <Button onClick={() => navigate('/')} className="w-full" size="lg">
          <Home className="w-5 h-5 mr-2" />
          Voltar ao início
        </Button>
      </motion.div>
    </div>
  );
};

export default PaymentPending;
