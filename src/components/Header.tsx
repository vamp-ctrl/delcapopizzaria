import { motion } from 'framer-motion';
import { ShoppingCart, User, LogOut, Clock, Truck, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import OpenStatus from './OpenStatus';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
interface HeaderProps {
  onCartClick: () => void;
}

const Header = ({ onCartClick }: HeaderProps) => {
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: storeStatus } = useQuery({
    queryKey: ['store-status-header'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_status')
        .select('delivery_time_minutes, pickup_time_minutes, minimum_order, delivery_fee')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success('Você saiu da sua conta');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <OpenStatus />
          
          {storeStatus && (
            <>
              {/* Desktop view */}
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1" title="Tempo de entrega">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{storeStatus.delivery_time_minutes}min</span>
                </div>
                <div className="flex items-center gap-1" title="Tempo de retirada">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{storeStatus.pickup_time_minutes}min</span>
                </div>
                {storeStatus.minimum_order > 0 && (
                  <div className="flex items-center gap-1" title="Pedido mínimo">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Mín R${storeStatus.minimum_order}</span>
                  </div>
                )}
                {storeStatus.delivery_fee > 0 && (
                  <div className="flex items-center gap-1" title="Taxa de entrega">
                    <span>Taxa R${storeStatus.delivery_fee}</span>
                  </div>
                )}
              </div>
              {/* Mobile view - compact */}
              <div className="flex sm:hidden items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-0.5" title="Entrega">
                  <Truck className="w-3 h-3 shrink-0" />
                  <span>{storeStatus.delivery_time_minutes}'</span>
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-0.5" title="Retirada">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>{storeStatus.pickup_time_minutes}'</span>
                </div>
                {storeStatus.minimum_order > 0 && (
                  <>
                    <span className="text-border">|</span>
                    <span className="whitespace-nowrap">Mín R${storeStatus.minimum_order}</span>
                  </>
                )}
                {storeStatus.delivery_fee > 0 && (
                  <>
                    <span className="text-border">|</span>
                    <span className="whitespace-nowrap">Taxa R${storeStatus.delivery_fee}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/auth')}
              title="Entrar"
            >
              <User className="w-5 h-5" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={onCartClick}
            className="relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold"
              >
                {itemCount}
              </motion.span>
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
