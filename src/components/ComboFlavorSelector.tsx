import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Star, Check, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePizzas } from '@/hooks/usePizzas';
import { useDrinks } from '@/hooks/useDrinks';
import { PizzaSize } from '@/types/menu';

interface ComboFlavorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (flavors: string[], premiumCount: number, selectedDrink: string | null) => void;
  maxFlavors: number;
  size: PizzaSize;
  comboName: string;
  availableDrinks: string[];
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
  availableDrinks,
}: ComboFlavorSelectorProps) => {
  const { pizzasSalgadas, pizzasDoces, loading } = usePizzas();
  const { drinks } = useDrinks();
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [premiumCount, setPremiumCount] = useState(0);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [step, setStep] = useState<'flavors' | 'drinks'>('flavors');

  // Filter available drinks from the combo items
  const comboDrinks = drinks.filter(drink => 
    availableDrinks.some(ad => 
      drink.name.toLowerCase().includes(ad.toLowerCase()) ||
      ad.toLowerCase().includes(drink.name.toLowerCase())
    )
  );

  const hasDrinkSelection = availableDrinks.length > 1 || comboDrinks.length > 1;

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedFlavors([]);
      setSearchTerm('');
      setPremiumCount(0);
      setSelectedDrink(null);
      setStep('flavors');
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

  const handleNext = () => {
    if (selectedFlavors.length === 0) return;
    
    if (hasDrinkSelection) {
      setStep('drinks');
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    if (selectedFlavors.length === 0) return;
    onConfirm(selectedFlavors, premiumCount, selectedDrink);
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
        onClick={() => handleToggleFlavor(pizza.name, !!isPremium)}
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

  const renderDrinkButton = (drink: { id: string; name: string; size: string }) => {
    const isSelected = selectedDrink === drink.name;

    return (
      <button
        key={drink.id}
        onClick={() => setSelectedDrink(drink.name)}
        className={`w-full text-left p-3 rounded-lg border transition-all ${
          isSelected
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">{drink.name}</span>
            <span className="text-xs text-muted-foreground">{drink.size}</span>
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
                  {step === 'flavors' ? 'Escolha os Sabores' : 'Escolha a Bebida'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {comboName} - Pizza {SIZE_LABELS[size]}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {step === 'flavors' ? (
              <>
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
                    onClick={handleNext}
                    disabled={selectedFlavors.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {hasDrinkSelection ? 'Próximo: Escolher Bebida' : `Confirmar Sabores (${selectedFlavors.length})`}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Drinks selection */}
                <div className="px-4 py-2 bg-muted/50 flex items-center justify-between shrink-0">
                  <span className="text-sm text-muted-foreground">
                    Sabores: {selectedFlavors.join(', ')}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                    Escolha sua bebida
                  </h4>
                  {comboDrinks.map(renderDrinkButton)}
                  
                  {/* Also show raw drink names from combo if no matches */}
                  {comboDrinks.length === 0 && availableDrinks.map((drinkName, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedDrink(drinkName)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedDrink === drinkName
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{drinkName}</span>
                        </div>
                        {selectedDrink === drinkName && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-background shrink-0 space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('flavors')}
                    className="w-full"
                  >
                    Voltar para Sabores
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!selectedDrink && hasDrinkSelection}
                    className="w-full"
                    size="lg"
                  >
                    Confirmar Combo
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComboFlavorSelector;