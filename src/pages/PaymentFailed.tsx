import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

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
          className="w-24 h-24 mx-auto bg-destructive/20 rounded-full flex items-center justify-center"
        >
          <XCircle className="w-12 h-12 text-destructive" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Pagamento não aprovado
          </h1>
          <p className="text-muted-foreground">
            Houve um problema com seu pagamento. Por favor, tente novamente.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted text-left space-y-2">
          <p className="font-medium">Possíveis motivos:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Saldo insuficiente</li>
            <li>Dados do cartão incorretos</li>
            <li>Transação não autorizada pelo banco</li>
            <li>Limite excedido</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate('/')} variant="outline" size="lg" className="w-full">
            <Home className="w-5 h-5 mr-2" />
            Voltar ao início
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentFailed;
