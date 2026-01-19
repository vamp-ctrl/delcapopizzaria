import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Pizza } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PizzaCardProps {
  pizza: Pizza;
  index: number;
  onOrderClick: () => void;
}

const PizzaCard = ({ pizza, index, onOrderClick }: PizzaCardProps) => {
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

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted-foreground">A partir de</span>
              <span className="text-2xl font-bold text-secondary ml-2">
                R$ {pizza.prices.P.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={onOrderClick}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-1" />
              Pedir
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PizzaCard;
