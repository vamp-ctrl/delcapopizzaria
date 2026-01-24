import { motion } from 'framer-motion';
import { Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface ComboItem {
  id: string;
  product_name: string;
  quantity: number;
}

interface ComboCardProps {
  combo: {
    id: string;
    name: string;
    description: string | null;
    regular_price: number;
    combo_price: number;
    items: ComboItem[];
  };
  index: number;
}

const ComboCard = ({ combo, index }: ComboCardProps) => {
  const { addItem } = useCart();
  const savings = combo.regular_price - combo.combo_price;
  const savingsPercent = Math.round((savings / combo.regular_price) * 100);

  const handleAddToCart = () => {
    addItem({
      id: `combo-${combo.id}`,
      type: 'combo',
      name: combo.name,
      price: combo.combo_price,
    });
    toast.success(`${combo.name} adicionado ao carrinho!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Package className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-foreground">{combo.name}</h4>
            {savingsPercent > 0 && (
              <Badge variant="secondary" className="text-xs">
                -{savingsPercent}%
              </Badge>
            )}
          </div>
          
          {combo.description && (
            <p className="text-sm text-muted-foreground mt-1">{combo.description}</p>
          )}
          
          <div className="mt-2 space-y-1">
            {combo.items.map((item) => (
              <p key={item.id} className="text-xs text-muted-foreground">
                • {item.quantity}x {item.product_name}
              </p>
            ))}
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div>
              {savings > 0 && (
                <span className="text-sm text-muted-foreground line-through mr-2">
                  R$ {combo.regular_price.toFixed(2)}
                </span>
              )}
              <span className="text-lg font-bold text-primary">
                R$ {combo.combo_price.toFixed(2)}
              </span>
            </div>
            <Button size="sm" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComboCard;
