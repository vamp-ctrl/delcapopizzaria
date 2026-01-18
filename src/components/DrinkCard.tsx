import { motion } from 'framer-motion';
import { Plus, Droplets, Coffee } from 'lucide-react';
import { Drink } from '@/types/menu';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DrinkCardProps {
  drink: Drink;
  index: number;
}

const DrinkCard = ({ drink, index }: DrinkCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: drink.id,
      type: 'drink',
      name: `${drink.name} ${drink.size}`,
      size: drink.size,
      price: drink.price
    });
    toast.success(`${drink.name} adicionado ao carrinho!`);
  };

  const Icon = drink.type === 'refrigerante' ? Droplets : Coffee;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          drink.type === 'refrigerante' ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-secondary'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{drink.name}</h4>
          <p className="text-xs text-muted-foreground">{drink.size}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-bold text-secondary">R$ {drink.price.toFixed(2)}</span>
        <Button
          onClick={handleAddToCart}
          size="icon"
          variant="outline"
          className="rounded-full h-8 w-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default DrinkCard;
