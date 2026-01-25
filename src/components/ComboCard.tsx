import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Pizza, Coffee } from 'lucide-react';
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
    pizza_size: string | null;
    allowed_flavor_ids: string[] | null;
    allowed_drink_ids: string[] | null;
    free_delivery: boolean;
    pizza_count: number;
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
         lowerName.includes('gigante') ||
         lowerName.includes(' g ') ||
         lowerName.includes(' m ') ||
         lowerName.includes(' p ');
};

// Check if item is a drink
const isDrinkItem = (productName: string) => {
  const lowerName = productName.toLowerCase();
  return lowerName.includes('coca') || 
         lowerName.includes('guaraná') ||
         lowerName.includes('pepsi') ||
         lowerName.includes('suco') ||
         lowerName.includes('refrigerante') ||
         lowerName.includes('água') ||
         lowerName.includes('fanta');
};

// Get pizza size from product name or combo config
const getPizzaSize = (productName: string, comboSize?: string | null): PizzaSize => {
  // First check if combo has explicit size
  if (comboSize) {
    const upperSize = comboSize.toUpperCase();
    if (['P', 'M', 'G', 'GG'].includes(upperSize)) {
      return upperSize as PizzaSize;
    }
  }
  
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
  
  // Check if combo has pizza items that need flavor selection
  const pizzaItems = combo.items.filter(item => isPizzaItem(item.product_name));
  const drinkItems = combo.items.filter(item => isDrinkItem(item.product_name));
  const hasPizza = pizzaItems.length > 0 || (combo.allowed_flavor_ids && combo.allowed_flavor_ids.length > 0);
  const hasDrinks = drinkItems.length > 0 || (combo.allowed_drink_ids && combo.allowed_drink_ids.length > 0);
  
  const firstPizzaItem = pizzaItems[0];
  const pizzaSize = getPizzaSize(firstPizzaItem?.product_name || '', combo.pizza_size);
  const maxFlavors = getMaxFlavors(pizzaSize);
  
  // Use pizza_count from combo, or calculate from items
  const pizzaCount = combo.pizza_count ?? 1;

  const handleChooseItems = () => {
    // Always show selector if combo has pizza or drinks to choose
    if (hasPizza || hasDrinks) {
      setShowFlavorSelector(true);
      return;
    }
    
    // No customization needed, just add to cart
    addItem({
      id: `combo-${combo.id}-${Date.now()}`,
      type: 'combo',
      name: combo.name,
      price: combo.combo_price,
    });
    
    toast.success(`${combo.name} adicionado ao carrinho!`);
  };

  const handleFlavorsConfirm = (flavors: string[], premiumCount: number, selectedDrink: string | null) => {
    const finalPrice = combo.combo_price + (premiumCount * PREMIUM_PRICE);
    
    // Build name with details
    let itemName = combo.name;
    if (flavors.length > 0) {
      itemName += ` - ${flavors.join(' / ')}`;
    }
    if (selectedDrink) {
      itemName += ` | ${selectedDrink}`;
    }
    
    // Store freeDelivery flag in the item for checkout calculation
    const cartItem: any = {
      id: `combo-${combo.id}-${Date.now()}`,
      type: 'combo',
      name: itemName,
      price: finalPrice,
      flavors: flavors,
      size: selectedDrink ? `Bebida: ${selectedDrink}` : undefined,
    };
    
    // Add free delivery metadata
    if (combo.free_delivery) {
      cartItem.freeDelivery = true;
    }
    
    addItem(cartItem);
    
    toast.success(`${combo.name} adicionado ao carrinho!`);
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
              {combo.free_delivery && (
                <Badge className="text-xs bg-green-500 hover:bg-green-600 text-white">
                  Entrega Grátis
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
                  {isDrinkItem(item.product_name) && (
                    <Coffee className="w-3 h-3 text-primary" />
                  )}
                </div>
              ))}
            </div>
            
            {hasPizza && (
              <p className="text-xs text-primary mt-2">
                {pizzaCount > 1 ? `${pizzaCount} pizzas - ` : ''}Escolha até {maxFlavors} sabores{pizzaCount > 1 ? ' cada' : ''}
                {hasDrinks && ' + bebida'}
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
              <Button size="sm" onClick={handleChooseItems}>
                <Pizza className="w-4 h-4 mr-1" />
                Escolher Itens
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <ComboFlavorSelector
        isOpen={showFlavorSelector}
        onClose={() => setShowFlavorSelector(false)}
        onConfirm={handleFlavorsConfirm}
        maxFlavors={maxFlavors}
        size={pizzaSize}
        comboName={combo.name}
        allowedFlavorIds={combo.allowed_flavor_ids}
        allowedDrinkIds={combo.allowed_drink_ids}
        hasPizzaSelection={hasPizza}
        hasDrinkSelection={hasDrinks}
      />
    </>
  );
};

export default ComboCard;
