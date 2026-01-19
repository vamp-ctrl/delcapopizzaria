import { motion, AnimatePresence } from 'framer-motion';
import { X, Pizza } from 'lucide-react';
import { PizzaSize, MAX_FLAVORS } from '@/types/menu';
import { Button } from '@/components/ui/button';

const sizes: { key: PizzaSize; label: string; description: string }[] = [
  { key: 'P', label: 'Pequena', description: 'Até 2 sabores' },
  { key: 'M', label: 'Média', description: 'Até 2 sabores' },
  { key: 'G', label: 'Grande', description: 'Até 3 sabores' },
  { key: 'GG', label: 'Gigante', description: 'Até 3 sabores' }
];

interface PizzaSizeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: PizzaSize) => void;
  prices: Record<PizzaSize, number>;
}

const PizzaSizeSelector = ({ isOpen, onClose, onSelectSize, prices }: PizzaSizeSelectorProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto bg-card border border-border rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pizza className="w-5 h-5" />
                <h3 className="font-display font-semibold">Escolha o Tamanho</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
              {sizes.map((size) => (
                <motion.button
                  key={size.key}
                  onClick={() => onSelectSize(size.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-lg border-2 border-border hover:border-primary bg-background transition-colors text-left"
                >
                  <div className="text-2xl font-bold text-primary mb-1">{size.key}</div>
                  <div className="text-sm font-medium text-foreground">{size.label}</div>
                  <div className="text-xs text-muted-foreground">{size.description}</div>
                  <div className="text-lg font-bold text-secondary mt-2">
                    R$ {prices[size.key].toFixed(2)}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PizzaSizeSelector;
