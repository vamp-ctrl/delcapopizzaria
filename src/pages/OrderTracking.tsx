import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Truck, Package, Home, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface OrderDetails {
  id: string;
  status: OrderStatus;
  customer_name: string;
  customer_address: string | null;
  created_at: string;
  total: number;
}

const STATUS_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Pedido Recebido', description: 'Aguardando confirmação da loja' },
  { status: 'confirmed', label: 'Aceito e em Preparo', description: 'Seu pedido está sendo preparado' },
  { status: 'delivered', label: 'Saiu para Entrega', description: 'Seu pedido está a caminho' },
];

const getStatusIndex = (status: OrderStatus): number => {
  if (status === 'pending') return 0;
  if (status === 'confirmed' || status === 'preparing' || status === 'ready') return 1;
  if (status === 'delivered') return 2;
  return -1; // cancelled
};

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, customer_name, customer_address, created_at, total')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        console.error('Error fetching order:', error);
        navigate('/');
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(prev => prev ? { ...prev, ...payload.new } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivery = !!order.customer_address;
  const orderNumber = order.id.slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Acompanhar Pedido</h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Início
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Order Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-card border border-border mb-6 text-center"
        >
          <p className="text-sm text-muted-foreground">Pedido</p>
          <p className="text-2xl font-bold font-mono text-primary">#{orderNumber}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
            {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </motion.div>

        {/* Status Timeline */}
        {isCancelled ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl bg-destructive/10 border border-destructive/20 text-center"
          >
            <p className="text-destructive font-bold text-lg">Pedido Cancelado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Entre em contato com a loja para mais informações
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-0"
          >
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isPending = index > currentStatusIndex;

              return (
                <div key={step.status} className="flex gap-4">
                  {/* Timeline line and dot */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-accent text-accent-foreground'
                          : isCurrent
                          ? 'bg-primary text-primary-foreground animate-pulse'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index === 0 && <Clock className="w-5 h-5" />}
                      {index === 1 && <CheckCircle2 className="w-5 h-5" />}
                      {index === 2 && (isDelivery ? <Truck className="w-5 h-5" /> : <Package className="w-5 h-5" />)}
                    </motion.div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-16 ${
                          isCompleted ? 'bg-accent' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pt-2 pb-6 ${isPending ? 'opacity-50' : ''}`}>
                    <p className={`font-semibold ${isCurrent ? 'text-primary' : ''}`}>
                      {step.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 rounded-xl bg-muted text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">Dúvidas sobre seu pedido?</p>
          <a
            href="https://wa.me/5569993618962"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary font-medium"
          >
            <Phone className="w-4 h-4" />
            (69) 99361-8962
          </a>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-card border border-border"
        >
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total do Pedido</span>
            <span className="text-xl font-bold text-primary">R$ {order.total.toFixed(2)}</span>
          </div>
          {isDelivery && order.customer_address && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">Endereço de entrega:</p>
              <p className="text-sm font-medium">{order.customer_address}</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default OrderTracking;
