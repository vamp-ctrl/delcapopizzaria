import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChefHat, 
  Truck,
  Package,
  RefreshCw,
  LogOut,
  Store,
  Bell,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
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
  order_items: OrderItem[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500', icon: CheckCircle2 },
  preparing: { label: 'Preparando', color: 'bg-orange-500', icon: ChefHat },
  ready: { label: 'Pronto', color: 'bg-green-500', icon: Package },
  delivered: { label: 'Entregue', color: 'bg-primary', icon: Truck },
  cancelled: { label: 'Cancelado', color: 'bg-destructive', icon: XCircle },
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
  cancelled: null,
};

const AdminDashboard = () => {
  const { user, signOut, signIn, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error('Erro ao fazer login', {
        description: 'Verifique seu email e senha'
      });
    }
    
    setLoginLoading(false);
  };

  useEffect(() => {
    if (!isAdmin) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
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
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          console.log('Order change:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the complete order with items
            const { data } = await supabase
              .from('orders')
              .select(`*, order_items (*)`)
              .eq('id', payload.new.id)
              .single();
            
            if (data) {
              setOrders(prev => [data, ...prev]);
              toast.success('Novo pedido recebido!', {
                description: `${data.customer_name} - R$ ${data.total.toFixed(2)}`,
              });
              // Play notification sound
              const audio = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
              audio.play().catch(() => {});
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
  }, [isAdmin]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erro ao atualizar pedido');
    } else {
      toast.success(`Pedido atualizado para: ${STATUS_CONFIG[newStatus].label}`);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // Show loading while auth is being resolved
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show login form if not logged in or not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary p-6 text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-display font-bold text-primary-foreground">
                Painel Administrativo
              </h1>
              <p className="text-primary-foreground/80 text-sm mt-1">
                Del Capone Pizzaria
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {user && !isAdmin && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
                  Esta conta não tem permissão de administrador
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loginLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loginLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                Entrar
              </Button>

              {user && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => signOut()}
                >
                  Sair da conta atual
                </Button>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading while fetching orders
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6" />
            <h1 className="font-display text-xl font-bold">Painel Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {orders.filter(o => o.status === 'pending').length} pendentes
            </Badge>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => signOut()}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos ({orders.length})
            </Button>
            {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map(status => {
              const config = STATUS_CONFIG[status];
              const count = orders.filter(o => o.status === status).length;
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
        </div>
      </div>

      {/* Orders */}
      <main className="container mx-auto px-4 py-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredOrders.map(order => {
                const statusConfig = STATUS_CONFIG[order.status];
                const StatusIcon = statusConfig.icon;
                const nextStatus = NEXT_STATUS[order.status];

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
                      <span className="text-sm opacity-90">
                        {formatTime(order.created_at)} - {formatDate(order.created_at)}
                      </span>
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
                              {item.notes && <span className="text-xs text-muted-foreground block">{item.notes}</span>}
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

                      {/* Actions */}
                      {nextStatus && (
                        <Button
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          className="w-full"
                          size="sm"
                        >
                          Avançar para: {STATUS_CONFIG[nextStatus].label}
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
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
