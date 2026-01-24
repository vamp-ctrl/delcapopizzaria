import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePizzas } from '@/hooks/usePizzas';
import { PizzaSize } from '@/types/menu';

interface ComboFlavorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (flavors: string[], premiumCount: number) => void;
  maxFlavors: number;
  size: PizzaSize;
  comboName: string;
}

const SIZE_LABELS: Record<PizzaSize, string> = {
  P: 'Pequena',
  M: 'Média',
  G: 'Grande',
  GG: 'Gigante',
};

const PREMIUM_PRICE = 10;

const ComboFlavorSelector = ({
  isOpen,
  onClose,
  onConfirm,
  maxFlavors,
  size,
  comboName,
}: ComboFlavorSelectorProps) => {
  const { pizzasSalgadas, pizzasDoces, loading } = usePizzas();
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [premiumCount, setPremiumCount] = useState(0);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedFlavors([]);
      setSearchTerm('');
      setPremiumCount(0);
    }
  }, [isOpen]);

  const handleToggleFlavor = (flavorName: string, isPremium: boolean) => {
    setSelectedFlavors(prev => {
      const isSelected = prev.includes(flavorName);
      if (isSelected) {
        if (isPremium) setPremiumCount(c => c - 1);
        return prev.filter(f => f !== flavorName);
      }
      if (prev.length >= maxFlavors) return prev;
      if (isPremium) setPremiumCount(c => c + 1);
      return [...prev, flavorName];
    });
  };

  const handleConfirm = () => {
    if (selectedFlavors.length === 0) return;
    onConfirm(selectedFlavors, premiumCount);
    onClose();
  };

  const filterBySearch = (items: { id: string; name: string; description?: string; isPremium?: boolean; base_price?: number }[]) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredSalgadas = filterBySearch(pizzasSalgadas);
  const filteredDoces = filterBySearch(pizzasDoces);

  const renderFlavorButton = (pizza: { id: string; name: string; description?: string; isPremium?: boolean; base_price?: number }) => {
    const isSelected = selectedFlavors.includes(pizza.name);
    const isPremium = pizza.isPremium || (pizza.base_price && pizza.base_price > 0);
    const isDisabled = !isSelected && selectedFlavors.length >= maxFlavors;

    return (
      <button
        key={pizza.id}
        onClick={() => handleToggleFlavor(pizza.name, isPremium)}
        disabled={isDisabled}
        className={`w-full text-left p-3 rounded-lg border transition-all ${
          isSelected
            ? 'border-primary bg-primary/10'
            : isDisabled
            ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{pizza.name}</span>
              {isPremium && (
                <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3" />
                  +R${PREMIUM_PRICE}
                </span>
              )}
            </div>
            {pizza.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {pizza.description}
              </p>
            )}
          </div>
          {isSelected && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full sm:max-w-lg bg-background rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display text-lg font-semibold">
                  Escolha os Sabores
                </h3>
                <p className="text-sm text-muted-foreground">
                  {comboName} - Pizza {SIZE_LABELS[size]}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Counter */}
            <div className="px-4 py-2 bg-muted/50 flex items-center justify-between shrink-0">
              <span className="text-sm text-muted-foreground">
                Sabores selecionados
              </span>
              <span className="font-semibold text-primary">
                {selectedFlavors.length}/{maxFlavors}
              </span>
            </div>

            {/* Search */}
            <div className="p-4 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar sabor..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Flavors list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : (
                <>
                  {/* Salgadas */}
                  {filteredSalgadas.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                        Salgadas
                      </h4>
                      <div className="space-y-2">
                        {filteredSalgadas.map(renderFlavorButton)}
                      </div>
                    </div>
                  )}

                  {/* Doces */}
                  {filteredDoces.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                        Doces
                      </h4>
                      <div className="space-y-2">
                        {filteredDoces.map(renderFlavorButton)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-background shrink-0">
              {premiumCount > 0 && (
                <p className="text-sm text-amber-600 mb-2 text-center">
                  Acréscimo de sabores especiais: +R$ {(premiumCount * PREMIUM_PRICE).toFixed(2)}
                </p>
              )}
              <Button
                onClick={handleConfirm}
                disabled={selectedFlavors.length === 0}
                className="w-full"
                size="lg"
              >
                Confirmar Sabores ({selectedFlavors.length})
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComboFlavorSelector;