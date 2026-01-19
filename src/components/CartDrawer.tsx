import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer um pedido');
      onClose();
      navigate('/auth');
      return;
    }

    const message = items
      .map(item => `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`)
      .join('%0A');
    
    const whatsappUrl = `https://w.app/sg7lgy?text=Olá! Gostaria de fazer um pedido:%0A%0A${message}%0A%0ATotal: R$ ${total.toFixed(2)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Redirecionando para o WhatsApp...');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-display text-xl font-semibold text-foreground">Seu Pedido</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                  <p>Seu carrinho está vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        {item.flavors && item.flavors.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {item.flavors.join(' / ')}
                          </p>
                        )}
                        <p className="text-sm text-secondary font-semibold">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-border space-y-4">
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Faça login para finalizar seu pedido
                  </p>
                )}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-primary text-2xl">R$ {total.toFixed(2)}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1"
                  >
                    Limpar
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {user ? 'Pedir via WhatsApp' : 'Fazer Login'}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
