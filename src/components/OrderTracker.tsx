import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, Truck, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface ActiveOrder {
  id: string;
  status: OrderStatus;
  customer_name: string;
  customer_address: string | null;
  created_at: string;
  total: number;
}

const STATUS_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Pedido Recebido', description: 'Aguardando confirmação' },
  { status: 'confirmed', label: 'Aceito e em Preparo', description: 'Seu pedido está sendo preparado' },
  { status: 'delivered', label: 'Saiu para Entrega', description: 'Seu pedido está a caminho' },
];

const getStatusIndex = (status: OrderStatus): number => {
  if (status === 'pending') return 0;
  if (status === 'confirmed' || status === 'preparing' || status === 'ready') return 1;
  if (status === 'delivered') return 2;
  return -1;
};

const OrderTracker = () => {
  const { user } = useAuth();
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchActiveOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, customer_name, customer_address, created_at, total')
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (!error && data) {
        setActiveOrders(data);
      }
      setLoading(false);
    };

    fetchActiveOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`user-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchActiveOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading || !user || activeOrders.length === 0) {
    return null;
  }

  const latestOrder = activeOrders[0];
  const currentStatusIndex = getStatusIndex(latestOrder.status);
  const orderNumber = latestOrder.id.slice(-6).toUpperCase();
  const isDelivery = !!latestOrder.customer_address;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-16 left-0 right-0 z-40 px-4 py-2"
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="bg-card border border-primary/30 rounded-xl shadow-lg overflow-hidden"
          layout
        >
          {/* Header - Always visible */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                {currentStatusIndex === 0 && <Clock className="w-5 h-5 text-primary" />}
                {currentStatusIndex === 1 && <CheckCircle2 className="w-5 h-5 text-primary" />}
                {currentStatusIndex === 2 && <Truck className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  Pedido #{orderNumber} - {STATUS_STEPS[currentStatusIndex]?.label || 'Em andamento'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {STATUS_STEPS[currentStatusIndex]?.description}
                </p>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Expanded content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {/* Progress bar */}
                  <div className="flex items-center gap-2">
                    {STATUS_STEPS.map((step, index) => (
                      <div key={step.status} className="flex-1 flex items-center">
                        <div
                          className={`w-full h-2 rounded-full transition-colors ${
                            index <= currentStatusIndex
                              ? 'bg-primary'
                              : 'bg-muted'
                          }`}
                        />
                        {index < STATUS_STEPS.length - 1 && (
                          <div className="w-2" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Status labels */}
                  <div className="flex justify-between text-xs">
                    {STATUS_STEPS.map((step, index) => (
                      <span
                        key={step.status}
                        className={`${
                          index <= currentStatusIndex
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    ))}
                  </div>

                  {/* Order info */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-semibold text-primary">
                        R$ {latestOrder.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {isDelivery ? (
                        <>
                          <Truck className="w-3 h-3" />
                          <span>Entrega</span>
                        </>
                      ) : (
                        <>
                          <Package className="w-3 h-3" />
                          <span>Retirada</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrderTracker;