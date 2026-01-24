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
  const pendingOrdersRef = useRef<Set<string>>(new Set());
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get orders from last 24 hours for the main view
  const getRecentOrders = (allOrders: Order[]) => {
    const twentyFourHoursAgo = subHours(new Date(), 24);
    return allOrders.filter(order => new Date(order.created_at) >= twentyFourHoursAgo);
  };

  // Play notification sound
  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // Setup repeating notification for pending orders
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    
    // Update pending orders set
    pendingOrdersRef.current = new Set(pendingOrders.map(o => o.id));

    // Clear existing interval
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }

    // If there are pending orders, play sound every 60 seconds
    if (pendingOrders.length > 0) {
      notificationIntervalRef.current = setInterval(() => {
        // Check if there are still pending orders
        if (pendingOrdersRef.current.size > 0) {
          playNotification();
          toast.warning(`🔔 ${pendingOrdersRef.current.size} pedido(s) aguardando!`, {
            description: 'Clique para aceitar',
          });
        }
      }, 60000); // 60 seconds
    }

    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, [orders]);

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
              playNotification();
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
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
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
    const printWindow = window.open('', '_blank', 'width=320,height=800');
    if (!printWindow) return;

    const isDelivery = !!order.customer_address;
    const orderDate = new Date(order.created_at);
    const dateStr = format(orderDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const orderNum = order.id.slice(-8).toUpperCase();

    // Parse items to show flavors properly
    const formatItem = (item: OrderItem) => {
      const notes = item.notes || '';
      // Check if notes contain flavor info (format: "Sabores: X, Y, Z")
      const flavorMatch = notes.match(/Sabores?:\s*(.+?)(?:\||$)/i);
      const flavors = flavorMatch ? flavorMatch[1].trim() : null;
      const otherNotes = notes.replace(/Sabores?:\s*.+?(?:\||$)/gi, '').trim();
      
      return { ...item, flavors, otherNotes };
    };

    const formattedItems = order.order_items.map(formatItem);

    const paymentMethodLabel = {
      pix: 'PIX',
      credit: 'Cartão de Crédito',
      debit: 'Cartão de Débito',
      cash: 'Dinheiro',
    }[order.payment_method || 'pix'] || order.payment_method;

    const paymentStatusLabel = {
      pending: 'AGUARDANDO PAGAMENTO',
      paid: 'PAGO',
      failed: 'FALHOU',
      refunded: 'REEMBOLSADO',
    }[order.payment_status] || order.payment_status;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comanda #${orderNum}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Courier New', Courier, monospace; 
            font-size: 14px; 
            font-weight: bold;
            width: 280px; 
            margin: 0 auto; 
            padding: 8px; 
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .divider { border-top: 2px dashed #000; margin: 10px 0; }
          .divider-double { border-top: 3px solid #000; margin: 10px 0; }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: 900; }
          .title { font-size: 20px; font-weight: 900; letter-spacing: 2px; }
          .subtitle { font-size: 12px; margin-top: 4px; font-weight: bold; }
          .section-title { font-weight: 900; font-size: 14px; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; font-weight: bold; }
          .item-block { margin: 8px 0; padding-left: 6px; border-left: 3px solid #000; }
          .item-name { font-weight: 900; font-size: 14px; }
          .item-detail { font-size: 13px; margin-left: 8px; font-weight: bold; }
          .flavors { font-size: 13px; margin-left: 8px; font-weight: bold; }
          .obs { background: #ddd; padding: 6px 8px; font-size: 13px; margin: 6px 0; font-weight: bold; }
          .total-section { background: #eee; padding: 10px; margin: 10px 0; }
          .grand-total { font-size: 20px; font-weight: 900; }
          .status-badge { 
            display: inline-block; 
            padding: 4px 10px; 
            border: 2px solid #000; 
            font-size: 12px; 
            font-weight: 900;
            margin: 6px 0;
          }
          .delivery-badge { background: #000; color: #fff; padding: 6px 10px; display: inline-block; margin: 6px 0; font-weight: 900; }
          .footer { font-size: 12px; margin-top: 14px; font-weight: bold; }
        </style>
      </head>
      <body>
        <!-- CABECALHO -->
        <div class="center">
          <div class="title">DEL CAPO PIZZARIA</div>
          <div class="subtitle">Sabor que conquista!</div>
        </div>
        
        <div class="divider-double"></div>
        
        <div class="center">
          <div class="bold" style="font-size: 16px;">PEDIDO #${orderNum}</div>
          <div style="font-size: 13px;">${dateStr}</div>
          <div class="${isDelivery ? 'delivery-badge' : 'status-badge'}">${isDelivery ? 'DELIVERY' : 'RETIRADA'}</div>
        </div>
        
        <div class="divider"></div>
        
        <!-- DADOS DO CLIENTE -->
        <div class="section-title">CLIENTE</div>
        <div><strong>Nome:</strong> ${order.customer_name}</div>
        <div><strong>Tel:</strong> ${order.customer_phone}</div>
        ${isDelivery ? `<div><strong>Endereco:</strong> ${order.customer_address}</div>` : ''}
        
        <div class="divider"></div>
        
        <!-- ITENS DO PEDIDO -->
        <div class="section-title">ITENS DO PEDIDO</div>
        ${formattedItems.map(item => `
          <div class="item-block">
            <div class="row">
              <span class="item-name">${item.quantity}x ${item.product_name}</span>
              <span class="bold">R$ ${item.total_price.toFixed(2)}</span>
            </div>
            ${item.size_name ? `<div class="item-detail">Tamanho: ${item.size_name}</div>` : ''}
            ${item.flavors ? `<div class="flavors">Sabores: ${item.flavors}</div>` : ''}
            ${item.otherNotes && item.otherNotes.length > 0 ? `<div class="obs">${item.otherNotes}</div>` : ''}
          </div>
        `).join('')}
        
        ${order.notes ? `
          <div class="divider"></div>
          <div class="section-title">OBSERVACOES</div>
          <div class="obs">${order.notes}</div>
        ` : ''}
        
        <div class="divider"></div>
        
        <!-- VALORES -->
        <div class="total-section">
          <div class="row">
            <span>Subtotal:</span>
            <span>R$ ${order.subtotal.toFixed(2)}</span>
          </div>
          ${order.delivery_fee > 0 ? `
            <div class="row">
              <span>Taxa de entrega:</span>
              <span>R$ ${order.delivery_fee.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="divider"></div>
          <div class="row grand-total">
            <span>TOTAL:</span>
            <span>R$ ${order.total.toFixed(2)}</span>
          </div>
        </div>
        
        <!-- PAGAMENTO -->
        <div class="section-title">PAGAMENTO</div>
        <div class="row">
          <span>Forma:</span>
          <span class="bold">${paymentMethodLabel}</span>
        </div>
        <div class="row">
          <span>Status:</span>
          <span class="status-badge">${paymentStatusLabel}</span>
        </div>
        
        <div class="divider-double"></div>
        
        <!-- RODAPE -->
        <div class="footer center">
          <div>Obrigado pela preferencia!</div>
          <div style="margin-top: 6px;">Del Capo Pizzaria</div>
          <div>(69) 99361-8962</div>
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
