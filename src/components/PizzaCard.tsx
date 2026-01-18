import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Pizza, PizzaSize } from '@/types/menu';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const sizes: { key: PizzaSize; label: string }[] = [
  { key: 'P', label: 'P' },
  { key: 'M', label: 'M' },
  { key: 'G', label: 'G' },
  { key: 'GG', label: 'GG' }
];

interface PizzaCardProps {
  pizza: Pizza;
  index: number;
}

const PizzaCard = ({ pizza, index }: PizzaCardProps) => {
  const [selectedSize, setSelectedSize] = useState<PizzaSize>('M');
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: `${pizza.id}-${selectedSize}`,
      type: 'pizza',
      name: `Pizza ${pizza.name} (${selectedSize})`,
      size: selectedSize,
      price: pizza.prices[selectedSize]
    });
    toast.success(`${pizza.name} (${selectedSize}) adicionada ao carrinho!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Card className="h-full hover:shadow-lg transition-shadow bg-card border-border">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">{pizza.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{pizza.description}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {sizes.map(size => (
              <button
                key={size.key}
                onClick={() => setSelectedSize(size.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedSize === size.key
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-secondary">
                R$ {pizza.prices[selectedSize].toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="bg-primary hover:bg-tomato-light text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PizzaCard;
