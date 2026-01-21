import { motion } from 'framer-motion';
import { Pizza } from 'lucide-react';
import { PizzaSize, MAX_FLAVORS, SIZE_PRICES } from '@/types/menu';

interface SizeCardProps {
  size: PizzaSize;
  label: string;
  index: number;
  onSelect: () => void;
}

const SizeCard = ({ size, label, index, onSelect }: SizeCardProps) => {
  const price = SIZE_PRICES[size];
  const maxFlavors = MAX_FLAVORS[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
    >
      {/* Header with size indicator */}
      <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-3 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold">{size}</span>
          </div>
          <h3 className="font-display text-2xl font-bold">{label}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 text-center space-y-4">
        {/* Flavor limit badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-full">
          <Pizza className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-foreground">
            Até {maxFlavors} sabor{maxFlavors > 1 ? 'es' : ''}
          </span>
        </div>

        {/* Fixed Price */}
        <div className="space-y-1">
          <p className="text-3xl font-bold text-secondary">
            R$ {price.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            *Sabores especiais têm acréscimo
          </p>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
            Escolher Sabores
            <span className="text-lg">→</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SizeCard;
