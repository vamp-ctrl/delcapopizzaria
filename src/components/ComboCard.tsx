import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Pizza } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import ComboFlavorSelector from './ComboFlavorSelector';
import { PizzaSize } from '@/types/menu';

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

const PREMIUM_PRICE = 10;

// Check if item is a pizza (contains size indicator)
const isPizzaItem = (productName: string) => {
  const lowerName = productName.toLowerCase();
  return lowerName.includes('pizza') || 
         lowerName.includes('grande') || 
         lowerName.includes('média') || 
         lowerName.includes('pequena') || 
         lowerName.includes('gigante');
};

// Get pizza size from product name
const getPizzaSize = (productName: string): PizzaSize => {
  const lowerName = productName.toLowerCase();
  if (lowerName.includes('gigante') || lowerName.includes('gg')) return 'GG';
  if (lowerName.includes('grande') || lowerName.includes(' g ') || lowerName.endsWith(' g')) return 'G';
  if (lowerName.includes('média') || lowerName.includes('media') || lowerName.includes(' m ') || lowerName.endsWith(' m')) return 'M';
  if (lowerName.includes('pequena') || lowerName.includes(' p ') || lowerName.endsWith(' p')) return 'P';
  return 'G'; // Default to Grande
};

// Get max flavors based on size
const getMaxFlavors = (size: PizzaSize): number => {
  return size === 'P' || size === 'M' ? 2 : 3;
};

const ComboCard = ({ combo, index }: ComboCardProps) => {
  const { addItem } = useCart();
  const savings = combo.regular_price - combo.combo_price;
  const savingsPercent = Math.round((savings / combo.regular_price) * 100);
  
  const [showFlavorSelector, setShowFlavorSelector] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [premiumExtra, setPremiumExtra] = useState(0);
  
  // Check if combo has pizza items that need flavor selection
  const pizzaItems = combo.items.filter(item => isPizzaItem(item.product_name));
  const hasPizza = pizzaItems.length > 0;
  const firstPizzaItem = pizzaItems[0];
  const pizzaSize = firstPizzaItem ? getPizzaSize(firstPizzaItem.product_name) : 'G';
  const maxFlavors = getMaxFlavors(pizzaSize);

  const handleAddToCart = () => {
    if (hasPizza && selectedFlavors.length === 0) {
      setShowFlavorSelector(true);
      return;
    }
    
    const finalPrice = combo.combo_price + premiumExtra;
    
    addItem({
      id: `combo-${combo.id}-${Date.now()}`,
      type: 'combo',
      name: combo.name,
      price: finalPrice,
      flavors: selectedFlavors.length > 0 ? selectedFlavors : undefined,
    });
    
    toast.success(`${combo.name} adicionado ao carrinho!`);
    setSelectedFlavors([]);
    setPremiumExtra(0);
  };

  const handleFlavorsConfirm = (flavors: string[], premiumCount: number) => {
    setSelectedFlavors(flavors);
    setPremiumExtra(premiumCount * PREMIUM_PRICE);
    
    // Add to cart immediately after selection
    const finalPrice = combo.combo_price + (premiumCount * PREMIUM_PRICE);
    
    addItem({
      id: `combo-${combo.id}-${Date.now()}`,
      type: 'combo',
      name: combo.name,
      price: finalPrice,
      flavors: flavors,
    });
    
    toast.success(`${combo.name} adicionado ao carrinho!`);
    setSelectedFlavors([]);
    setPremiumExtra(0);
  };

  return (
    <>
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
                <div key={item.id} className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">
                    • {item.quantity}x {item.product_name}
                  </p>
                  {isPizzaItem(item.product_name) && (
                    <Pizza className="w-3 h-3 text-primary" />
                  )}
                </div>
              ))}
            </div>
            
            {hasPizza && (
              <p className="text-xs text-primary mt-2">
                Escolha até {maxFlavors} sabores
              </p>
            )}
            
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
                {hasPizza ? 'Escolher Sabores' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {hasPizza && (
        <ComboFlavorSelector
          isOpen={showFlavorSelector}
          onClose={() => setShowFlavorSelector(false)}
          onConfirm={handleFlavorsConfirm}
          maxFlavors={maxFlavors}
          size={pizzaSize}
          comboName={combo.name}
        />
      )}
    </>
  );
};

export default ComboCard;