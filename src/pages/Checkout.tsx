import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, User, Phone, CreditCard, QrCode, Loader2, Store, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type PaymentMethod = 'pix' | 'credit' | 'debit';
type DeliveryType = 'delivery' | 'pickup';

interface Profile {
  name: string | null;
  phone: string | null;
  address: string | null;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user, session } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [storeOpen, setStoreOpen] = useState(true);
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState('');

  const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
  const finalTotal = total + deliveryFee;

  // Check if store is open
  useEffect(() => {
    const checkStoreStatus = async () => {
      const { data } = await supabase.from('store_settings').select('is_open').single();
      if (data) setStoreOpen(data.is_open);
    };
    checkStoreStatus();
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      navigate('/');
      return;
    }

    // Fetch user profile
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name, phone, address')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setCustomerName(data.name || '');
        setCustomerPhone(data.phone || '');
        setCustomerAddress(data.address || '');
      }
    };

    fetchProfile();
  }, [user, items, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !session) {
      toast.error('Você precisa estar logado');
      navigate('/auth');
      return;
    }

    if (!customerName || !customerPhone) {
      toast.error('Preencha nome e telefone');
      return;
    }

    if (deliveryType === 'delivery' && !customerAddress) {
      toast.error('Preencha o endereço de entrega');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: deliveryType === 'delivery' ? customerAddress : null,
          subtotal: total,
          delivery_fee: deliveryFee,
          total: finalTotal,
          notes: notes || null,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.name,
        size_name: item.size || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        notes: item.flavors?.join(' / ') || null,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Create payment with Mercado Pago
      const response = await supabase.functions.invoke('create-payment', {
        body: {
          orderId: order.id,
          amount: finalTotal,
          customerEmail: user.email,
          customerName: customerName,
          description: `Pedido Del Capo Pizzaria - ${items.length} item(s)`,
          paymentMethod: paymentMethod,
        },
      });

      if (response.error) throw response.error;

      const { initPoint } = response.data;

      // 4. Clear cart and redirect to payment
      clearCart();
      window.location.href = initPoint;

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display text-xl font-bold">Finalizar Pedido</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <h2 className="font-semibold text-lg mb-3">Resumo do Pedido</h2>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de entrega</span>
                  <span>{deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2)}` : 'Grátis'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total</span>
                  <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Customer Info */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-card border border-border space-y-4"
          >
            <h2 className="font-semibold text-lg">Seus Dados</h2>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Nome
              </Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Telefone
              </Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </motion.section>

          {/* Delivery Type */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-card border border-border space-y-4"
          >
            <h2 className="font-semibold text-lg">Tipo de Pedido</h2>
            
            <RadioGroup value={deliveryType} onValueChange={(v) => setDeliveryType(v as DeliveryType)}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Entrega</p>
                    <p className="text-xs text-muted-foreground">R$ 5,00</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Store className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Retirada na loja</p>
                    <p className="text-xs text-muted-foreground">Grátis</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {deliveryType === 'delivery' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Endereço de entrega
                </Label>
                <Textarea
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Rua, número, bairro, complemento..."
                  required
                />
              </motion.div>
            )}
          </motion.section>

          {/* Payment Method */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-card border border-border space-y-4"
          >
            <h2 className="font-semibold text-lg">Forma de Pagamento</h2>
            
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                  <QrCode className="w-5 h-5 text-accent" />
                  <div>
                    <p className="font-medium">PIX</p>
                    <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <RadioGroupItem value="credit" id="credit" />
                <Label htmlFor="credit" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">Parcele em até 12x</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <RadioGroupItem value="debit" id="debit" />
                <Label htmlFor="debit" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="font-medium">Cartão de Débito</p>
                    <p className="text-xs text-muted-foreground">Débito na hora</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </motion.section>

          {/* Notes */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-card border border-border space-y-4"
          >
            <h2 className="font-semibold text-lg">Observações (opcional)</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alguma observação sobre o pedido?"
            />
          </motion.section>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {!storeOpen && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center mb-4">
                <p className="text-destructive font-medium">🚫 Loja fechada no momento</p>
                <p className="text-sm text-muted-foreground">Volte durante nosso horário de funcionamento</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || !storeOpen}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Pagar R$ {finalTotal.toFixed(2)}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
