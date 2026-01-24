import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck,
  Bell,
  Printer,
  Calendar as CalendarIcon,
  ChevronLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format, isToday, subHours, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

interface OrderItem {
  id: string;
  product_name: string;
  size_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  created_at: string;
  printed: boolean;
  order_items: OrderItem[];
}

// Simplified status config - only show relevant statuses
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Aceito', color: 'bg-blue-500', icon: CheckCircle2 },
  preparing: { label: 'Preparando', color: 'bg-orange-500', icon: Clock },
  ready: { label: 'Pronto', color: 'bg-green-500', icon: Clock },
  delivered: { label: 'Entregue', color: 'bg-primary', icon: Truck },
  cancelled: { label: 'Cancelado', color: 'bg-destructive', icon: XCircle },
};

// Simplified flow: pending -> confirmed -> delivered
const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'delivered',
  preparing: 'delivered',
  ready: 'delivered',
  delivered: null,
  cancelled: null,
};

// Labels for the simplified actions
const getActionLabel = (currentStatus: OrderStatus): string => {
  switch (currentStatus) {
    case 'pending':
      return 'Aceitar pedido';
    case 'confirmed':
    case 'preparing':
    case 'ready':
      return 'Pedido enviado para entrega';
    default:
      return '';
  }
};

const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get orders from last 24 hours for the main view
  const getRecentOrders = (allOrders: Order[]) => {
    const twentyFourHoursAgo = subHours(new Date(), 24);
    return allOrders.filter(order => new Date(order.created_at) >= twentyFourHoursAgo);
  };

  useEffect(() => {
    // Preload notification sound
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.load();

    const fetchOrders = async () => {
      // Fetch only orders from the last 24 hours for the main view
      const twentyFourHoursAgo = subHours(new Date(), 24).toISOString();
      
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items (*)`)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Erro ao carregar pedidos');
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const { data } = await supabase
              .from('orders')
              .select(`*, order_items (*)`)
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              setOrders(prev => [data, ...prev]);
              toast.success('🔔 Novo pedido recebido!', {
                description: `${data.customer_name} - R$ ${data.total.toFixed(2)}`,
              });
              // Play notification sound
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => {});
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => 
              prev.map(order => 
                order.id === payload.new.id 
                  ? { ...order, ...payload.new }
                  : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders(prev => prev.filter(order => order.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch orders for a specific date (history)
  const fetchOrdersByDate = async (date: Date) => {
    setLoadingHistory(true);
    
    const start = startOfDay(date).toISOString();
    const end = endOfDay(date).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select(`*, order_items (*)`)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history orders:', error);
      toast.error('Erro ao carregar histórico');
    } else {
      setHistoryOrders(data || []);
    }
    setLoadingHistory(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setShowHistory(true);
      fetchOrdersByDate(date);
    }
  };

  const handleBackToMain = () => {
    setShowHistory(false);
    setSelectedDate(undefined);
    setHistoryOrders([]);
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erro ao atualizar pedido');
    } else {
      const actionMessage = newStatus === 'confirmed' 
        ? 'Pedido aceito!' 
        : newStatus === 'delivered' 
          ? 'Pedido enviado para entrega!' 
          : `Status atualizado: ${STATUS_CONFIG[newStatus].label}`;
      
      toast.success(actionMessage);
      
      // Auto print when accepting order
      if (newStatus === 'confirmed') {
        const order = orders.find(o => o.id === orderId) || historyOrders.find(o => o.id === orderId);
        if (order) {
          handlePrint(order);
        }
      }
    }
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comanda #${order.id.slice(0, 8)}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 10px; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .title { font-size: 18px; font-weight: bold; }
          .info { margin: 5px 0; }
          .items { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .notes { background: #f0f0f0; padding: 5px; margin: 5px 0; font-style: italic; }
          .total { font-size: 16px; font-weight: bold; text-align: right; }
          .footer { text-align: center; margin-top: 20px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">DEL CAPO PIZZARIA</div>
          <div>${new Date(order.created_at).toLocaleString('pt-BR')}</div>
          <div>Pedido #${order.id.slice(0, 8).toUpperCase()}</div>
        </div>
        
        <div class="info">
          <strong>Cliente:</strong> ${order.customer_name}<br/>
          <strong>Tel:</strong> ${order.customer_phone}<br/>
          ${order.customer_address ? `<strong>End:</strong> ${order.customer_address}` : '<strong>RETIRADA NA LOJA</strong>'}
        </div>
        
        <div class="items">
          <strong>ITENS:</strong>
          ${order.order_items.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.product_name}${item.size_name ? ` (${item.size_name})` : ''}</span>
              <span>R$ ${item.total_price.toFixed(2)}</span>
            </div>
            ${item.notes ? `<div class="notes">→ ${item.notes}</div>` : ''}
          `).join('')}
        </div>
        
        ${order.notes ? `<div class="notes"><strong>OBS:</strong> ${order.notes}</div>` : ''}
        
        <div class="total">
          <div>Subtotal: R$ ${order.subtotal.toFixed(2)}</div>
          <div>Entrega: R$ ${order.delivery_fee.toFixed(2)}</div>
          <div style="font-size: 20px;">TOTAL: R$ ${order.total.toFixed(2)}</div>
        </div>
        
        <div class="footer">
          Obrigado pela preferência!<br/>
          Del Capo Pizzaria
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); }
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();

    // Mark as printed
    supabase.from('orders').update({ printed: true }).eq('id', order.id);
  };

  const displayOrders = showHistory ? historyOrders : orders;
  const filteredOrders = filter === 'all' 
    ? displayOrders 
    : displayOrders.filter(o => o.status === filter);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Active statuses to show in filters (simplified view)
  const activeStatuses: OrderStatus[] = ['pending', 'confirmed', 'delivered', 'cancelled'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with History Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {showHistory ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBackToMain}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <span className="text-muted-foreground">
              Histórico de {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Pedidos das últimas 24 horas
          </div>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              Histórico
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date > new Date()}
              locale={ptBR}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos ({displayOrders.length})
        </Button>
        {activeStatuses.map(status => {
          const config = STATUS_CONFIG[status];
          const count = displayOrders.filter(o => o.status === status).length;
          return (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="whitespace-nowrap"
            >
              {config.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Loading History */}
      {loadingHistory && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Orders Grid */}
      {!loadingHistory && filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{showHistory ? 'Nenhum pedido nesta data' : 'Nenhum pedido encontrado'}</p>
        </div>
      ) : (
        !loadingHistory && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredOrders.map(order => {
                const statusConfig = STATUS_CONFIG[order.status];
                const StatusIcon = statusConfig.icon;
                const nextStatus = NEXT_STATUS[order.status];
                const actionLabel = getActionLabel(order.status);

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                    className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                  >
                    {/* Order Header */}
                    <div className={`p-3 ${statusConfig.color} text-white flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-semibold">{statusConfig.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrint(order)}
                          className="p-1 hover:bg-white/20 rounded transition-colors"
                          title="Imprimir comanda"
                        >
                          <Printer className={`w-5 h-5 ${order.printed ? 'opacity-50' : ''}`} />
                        </button>
                        <span className="text-sm opacity-90">
                          {formatTime(order.created_at)} - {formatDate(order.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-4 space-y-3">
                      {/* Customer Info */}
                      <div>
                        <p className="font-semibold text-foreground">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                        {order.customer_address && (
                          <p className="text-sm text-muted-foreground mt-1">
                            📍 {order.customer_address}
                          </p>
                        )}
                      </div>

                      {/* Items */}
                      <div className="border-t border-border pt-3">
                        {order.order_items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm py-1">
                            <span>
                              {item.quantity}x {item.product_name}
                              {item.size_name && <span className="text-muted-foreground"> ({item.size_name})</span>}
                              {item.notes && <span className="text-xs text-primary block">→ {item.notes}</span>}
                            </span>
                            <span className="font-medium">R$ {item.total_price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="p-2 bg-muted rounded-lg text-sm">
                          <strong>Obs:</strong> {order.notes}
                        </div>
                      )}

                      {/* Total */}
                      <div className="border-t border-border pt-3 flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {order.delivery_fee > 0 ? 'Entrega' : 'Retirada'}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            R$ {order.total.toFixed(2)}
                          </p>
                          <Badge 
                            variant={order.payment_status === 'approved' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {order.payment_status === 'approved' ? 'Pago' : 'Aguardando'}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions - Simplified */}
                      {nextStatus && actionLabel && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          className="w-full"
                          size="sm"
                        >
                          {actionLabel}
                        </Button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-destructive hover:text-destructive"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          Cancelar Pedido
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )
      )}
    </div>
  );
};

export default OrdersTab;
