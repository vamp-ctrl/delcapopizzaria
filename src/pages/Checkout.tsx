import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, User, Phone, CreditCard, QrCode, Loader2, Store, Truck, Tag, X, Check } from 'lucide-react';
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

interface StoreStatus {
  is_open: boolean;
  delivery_time_minutes: number;
  pickup_time_minutes: number;
  minimum_order: number;
  delivery_fee: number;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at: string | null;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user, session } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [storeStatus, setStoreStatus] = useState<StoreStatus>({
    is_open: true,
    delivery_time_minutes: 45,
    pickup_time_minutes: 20,
    minimum_order: 0,
    delivery_fee: 5,
  });
  
  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerStreet, setCustomerStreet] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerComplement, setCustomerComplement] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [notes, setNotes] = useState('');
  
  // Coupon state
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Check if any combo has free delivery
  const hasFreeDeliveryCombo = items.some(item => item.type === 'combo' && item.freeDelivery);
  
  // Calculate delivery fee (0 if free delivery combo is in cart)
  const deliveryFee = deliveryType === 'delivery' && !hasFreeDeliveryCombo ? storeStatus.delivery_fee : 0;
  
  // Calculate discount
  const calculateDiscount = (coupon: Coupon | null, subtotal: number): number => {
    if (!coupon) return 0;
    if (coupon.discount_type === 'percentage') {
      return (subtotal * coupon.discount_value) / 100;
    }
    return coupon.discount_value;
  };
  
  const discountAmount = calculateDiscount(appliedCoupon, total);
  const finalTotal = Math.max(0, total - discountAmount + deliveryFee);
  const meetsMinimumOrder = total >= storeStatus.minimum_order;

  // Check store status and fetch coupons
  useEffect(() => {
    const fetchStoreStatus = async () => {
      const { data } = await supabase
        .from('store_status')
        .select('is_open, delivery_time_minutes, pickup_time_minutes, minimum_order, delivery_fee')
        .single();
      if (data) {
        setStoreStatus({
          is_open: data.is_open ?? true,
          delivery_time_minutes: data.delivery_time_minutes ?? 45,
          pickup_time_minutes: data.pickup_time_minutes ?? 20,
          minimum_order: data.minimum_order ?? 0,
          delivery_fee: data.delivery_fee ?? 5,
        });
      }
    };
    
    const fetchCoupons = async () => {
      setLoadingCoupons(true);
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true);
      
      if (data) {
        // Filter coupons that meet requirements
        const now = new Date();
        const validCoupons = data.filter(coupon => {
          // Check expiration
          if (coupon.expires_at && new Date(coupon.expires_at) < now) return false;
          // Check usage limit
          if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) return false;
          return true;
        });
        setAvailableCoupons(validCoupons);
      }
      setLoadingCoupons(false);
    };
    
    fetchStoreStatus();
    fetchCoupons();
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

    // Fetch user profile - run immediately
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, phone, address')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setProfile(data);
          // Only set if not already set (avoid overwriting user edits)
          if (!customerName) setCustomerName(data.name || '');
          if (!customerPhone) setCustomerPhone(data.phone || '');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      }
    };

    fetchProfile();
  }, [user, items.length, navigate]);

  // Check if coupon meets order requirements
  const isCouponValid = (coupon: Coupon): boolean => {
    if (coupon.min_order_value && total < coupon.min_order_value) return false;
    return true;
  };

  const applyCoupon = (coupon: Coupon) => {
    if (!isCouponValid(coupon)) {
      toast.error(`Pedido mínimo de R$ ${coupon.min_order_value?.toFixed(2)} para usar este cupom`);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponCode(coupon.code);
    toast.success(`Cupom "${coupon.code}" aplicado!`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

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

    if (deliveryType === 'delivery' && !customerStreet) {
      toast.error('Preencha a rua de entrega');
      return;
    }
    if (deliveryType === 'delivery' && !customerNumber) {
      toast.error('Preencha o número');
      return;
    }

    setLoading(true);

    try {
      // 1. Validate and use coupon atomically (if applied)
      let validatedCoupon = null;
      if (appliedCoupon) {
        const { data: couponResult, error: couponError } = await supabase
          .rpc('validate_and_use_coupon', {
            p_coupon_code: appliedCoupon.code,
            p_order_total: total,
          });

        const result = couponResult as { valid: boolean; error?: string } | null;
        
        if (couponError || !result?.valid) {
          const errorMsg = result?.error || 'Erro ao validar cupom';
          toast.error(errorMsg);
          setAppliedCoupon(null);
          setCouponCode('');
          setLoading(false);
          return;
        }
        validatedCoupon = result;
      }

      // 2. Create order in database - INCLUDE payment_method!
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: deliveryType === 'delivery' ? `${customerStreet}, ${customerNumber}${customerComplement ? ' - ' + customerComplement : ''}` : null,
          subtotal: total,
          delivery_fee: deliveryFee,
          discount_amount: discountAmount,
          coupon_code: appliedCoupon?.code || null,
          total: finalTotal,
          notes: notes || null,
          status: 'pending',
          payment_status: 'pending',
          payment_method: paymentMethod,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create order items with complete notes
      const orderItems = items.map(item => {
        // Build comprehensive notes for the receipt
        const notesParts: string[] = [];
        
        if (item.flavors && item.flavors.length > 0) {
          notesParts.push(`Sabores: ${item.flavors.join(', ')}`);
        }
        
        if (item.border) {
          notesParts.push(`Borda: ${item.border}`);
        }
        
        // Check if size contains drink info (from combos)
        if (item.size && item.size.startsWith('Bebida:')) {
          notesParts.push(item.size);
        }
        
        return {
          order_id: order.id,
          product_name: item.name,
          size_name: item.size && !item.size.startsWith('Bebida:') ? item.size : (item.type === 'pizza' ? item.size : null),
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          notes: notesParts.length > 0 ? notesParts.join(' | ') : null,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Order created successfully - redirect to confirmation
      clearCart();
      toast.success('Pedido enviado com sucesso!');
      navigate(`/pedido-confirmado?order_id=${order.id}`);

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

  // Filter coupons that can be used with current order
  const usableCoupons = availableCoupons.filter(isCouponValid);

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
                    {item.flavors && item.flavors.length > 0 && (
                      <span className="text-xs block text-muted-foreground/70">
                        ({item.flavors.join(', ')})
                      </span>
                    )}
                  </span>
                  <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Desconto ({appliedCoupon?.code})
                    </span>
                    <span>-R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
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
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed"
                placeholder="Seu nome completo"
              />
              <p className="text-xs text-muted-foreground">Nome cadastrado (não editável)</p>
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
              <p className="text-xs text-muted-foreground">Edite se necessário</p>
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
                    <p className="text-xs text-muted-foreground">
                      R$ {storeStatus.delivery_fee.toFixed(2)} • ~{storeStatus.delivery_time_minutes} min
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Store className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Retirada na loja</p>
                    <p className="text-xs text-muted-foreground">
                      Grátis • ~{storeStatus.pickup_time_minutes} min
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {deliveryType === 'delivery' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Endereço de entrega
                </Label>
                <Input
                  id="street"
                  value={customerStreet}
                  onChange={(e) => setCustomerStreet(e.target.value)}
                  placeholder="Rua / Avenida"
                  required
                />
                <div className="flex gap-3">
                  <Input
                    id="number"
                    value={customerNumber}
                    onChange={(e) => setCustomerNumber(e.target.value)}
                    placeholder="Número"
                    required
                    className="w-28"
                  />
                  <Input
                    id="complement"
                    value={customerComplement}
                    onChange={(e) => setCustomerComplement(e.target.value)}
                    placeholder="Complemento (opcional)"
                    className="flex-1"
                  />
                </div>
              </motion.div>
            )}

            {deliveryType === 'pickup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                <Label className="flex items-center gap-2 mb-1">
                  <Store className="w-4 h-4" /> Endereço para retirada
                </Label>
                <p className="text-sm font-medium">Av. Curitiba, 3482 - Jardim Primavera</p>
                <p className="text-xs text-muted-foreground">Vilhena - RO</p>
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
            
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                💳 Pagamento no cartão de crédito e débito <strong>somente na entrega</strong>. Não trabalhamos com pagamento pelo app.
              </p>
            </div>

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
                    <p className="text-xs text-muted-foreground">Na entrega</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <RadioGroupItem value="debit" id="debit" />
                <Label htmlFor="debit" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="font-medium">Cartão de Débito</p>
                    <p className="text-xs text-muted-foreground">Na entrega</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'pix' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg bg-muted/50 border border-border space-y-2"
              >
                <p className="text-sm font-semibold">Chave PIX (CPF):</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono font-bold text-primary select-all">038.490.122-04</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText('038.490.122-04');
                      toast.success('Chave PIX copiada!');
                    }}
                    className="h-8 px-2 text-xs"
                  >
                    Copiar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Após o pagamento, envie o comprovante no WhatsApp da pizzaria:
                </p>
                <a
                  href="https://wa.me/5569992517150?text=Segue%20o%20comprovante%20do%20PIX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:underline"
                >
                  📱 (69) 9 9251-7150
                </a>
              </motion.div>
            )}
          </motion.section>

          {/* Coupons Section */}
          {usableCoupons.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="p-4 rounded-xl bg-card border border-border space-y-4"
            >
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Cupons Disponíveis
              </h2>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.discount_type === 'percentage' 
                          ? `${appliedCoupon.discount_value}% de desconto`
                          : `R$ ${appliedCoupon.discount_value.toFixed(2)} de desconto`}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={removeCoupon}
                    className="text-green-700 hover:text-green-900"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {usableCoupons.map(coupon => (
                    <button
                      key={coupon.id}
                      type="button"
                      onClick={() => applyCoupon(coupon)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{coupon.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.discount_value}% de desconto`
                            : `R$ ${coupon.discount_value.toFixed(2)} de desconto`}
                          {coupon.min_order_value > 0 && ` (mín. R$ ${coupon.min_order_value.toFixed(2)})`}
                        </p>
                      </div>
                      <span className="text-xs text-primary font-medium">Aplicar</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.section>
          )}

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
            {!storeStatus.is_open && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-center mb-4">
                <p className="text-destructive font-medium">Loja fechada no momento</p>
                <p className="text-sm text-muted-foreground">Volte durante nosso horário de funcionamento</p>
              </div>
            )}

            {storeStatus.minimum_order > 0 && !meetsMinimumOrder && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center mb-4">
                <p className="text-amber-600 font-medium">Pedido mínimo: R$ {storeStatus.minimum_order.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Adicione mais R$ {(storeStatus.minimum_order - total).toFixed(2)} ao seu pedido
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !storeStatus.is_open || !meetsMinimumOrder}
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
                  Enviar Pedido — R$ {finalTotal.toFixed(2)}
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