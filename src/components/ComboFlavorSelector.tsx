import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Star, Check, Coffee, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { usePizzas } from '@/hooks/usePizzas';
import { useDrinks } from '@/hooks/useDrinks';
import { supabase } from '@/integrations/supabase/client';
import { PizzaSize, BorderOption } from '@/types/menu';

interface ComboFlavorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (flavors: string[], premiumCount: number, selectedDrink: string | null, selectedBorder: { name: string; price: number } | null) => void;
  maxFlavors: number;
  size: PizzaSize;
  comboName: string;
  allowedFlavorIds: string[] | null;
  allowedDrinkIds: string[] | null;
  hasPizzaSelection: boolean;
  hasDrinkSelection: boolean;
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
  allowedFlavorIds,
  allowedDrinkIds,
  hasPizzaSelection,
  hasDrinkSelection,
}: ComboFlavorSelectorProps) => {
  const { pizzasSalgadas, pizzasDoces, loading } = usePizzas();
  const { drinks } = useDrinks();
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [premiumCount, setPremiumCount] = useState(0);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [selectedBorder, setSelectedBorder] = useState<{ name: string; price: number } | null>(null);
  const [borderOptions, setBorderOptions] = useState<BorderOption[]>([]);
  const [step, setStep] = useState<'flavors' | 'drinks' | 'border'>('flavors');

  // Fetch border options
  useEffect(() => {
    const fetchBorders = async () => {
      const { data } = await supabase
        .from('border_options')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (data) {
        setBorderOptions(data);
        const noBorder = data.find(b => b.price === 0);
        if (noBorder) setSelectedBorder({ name: noBorder.name, price: 0 });
      }
    };
    fetchBorders();
  }, []);

  // Filter flavors by allowed IDs if specified
  const filterByAllowedIds = (items: { id: string; name: string; description?: string; isPremium?: boolean; base_price?: number }[]) => {
    if (!allowedFlavorIds || allowedFlavorIds.length === 0) {
      return items; // No restriction, show all
    }
    return items.filter(item => allowedFlavorIds.includes(item.id));
  };

  // Filter drinks by allowed IDs if specified
  const filterDrinksByAllowedIds = (drinksList: { id: string; name: string; size: string }[]) => {
    if (!allowedDrinkIds || allowedDrinkIds.length === 0) {
      return drinksList; // No restriction, show all
    }
    return drinksList.filter(drink => allowedDrinkIds.includes(drink.id));
  };

  const availableFlavors = {
    salgadas: filterByAllowedIds(pizzasSalgadas),
    doces: filterByAllowedIds(pizzasDoces),
  };

  const availableDrinks = filterDrinksByAllowedIds(drinks);

  // Determine what step to show first
  useEffect(() => {
    if (isOpen) {
      if (hasPizzaSelection && (availableFlavors.salgadas.length > 0 || availableFlavors.doces.length > 0)) {
        setStep('flavors');
      } else if (hasDrinkSelection && availableDrinks.length > 0) {
        setStep('drinks');
      }
    }
  }, [isOpen, hasPizzaSelection, hasDrinkSelection, availableFlavors.salgadas.length, availableFlavors.doces.length, availableDrinks.length]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedFlavors([]);
      setSearchTerm('');
      setPremiumCount(0);
      setSelectedDrink(null);
      const noBorder = borderOptions.find(b => b.price === 0);
      setSelectedBorder(noBorder ? { name: noBorder.name, price: 0 } : null);
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
    if (step === 'flavors' && hasDrinkSelection && availableDrinks.length > 0) {
      setStep('drinks');
    } else if (step === 'drinks' || step === 'flavors') {
      // Go to border step if pizza selection exists
      if (hasPizzaSelection && borderOptions.length > 0) {
        setStep('border');
      } else {
        handleConfirm();
      }
    } else {
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    if (hasPizzaSelection && selectedFlavors.length === 0 && (availableFlavors.salgadas.length > 0 || availableFlavors.doces.length > 0)) {
      return;
    }
    onConfirm(selectedFlavors, premiumCount, selectedDrink, selectedBorder);
    onClose();
  };

  const filterBySearch = (items: { id: string; name: string; description?: string; isPremium?: boolean; base_price?: number }[]) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredSalgadas = filterBySearch(availableFlavors.salgadas);
  const filteredDoces = filterBySearch(availableFlavors.doces);

  const showFlavorStep = hasPizzaSelection && (availableFlavors.salgadas.length > 0 || availableFlavors.doces.length > 0);
  const showDrinkStep = hasDrinkSelection && availableDrinks.length > 0;

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
            {drink.size && <span className="text-xs text-muted-foreground">{drink.size}</span>}
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
                  {step === 'flavors' ? 'Escolha os Sabores' : step === 'drinks' ? 'Escolha a Bebida' : 'Escolha a Borda'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {comboName} {showFlavorStep && `- Pizza ${SIZE_LABELS[size]}`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {step === 'flavors' && showFlavorStep ? (
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

                      {filteredSalgadas.length === 0 && filteredDoces.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Nenhum sabor encontrado
                        </p>
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
                    {showDrinkStep ? 'Próximo: Escolher Bebida' : (hasPizzaSelection && borderOptions.length > 0) ? 'Próximo: Escolher Borda' : `Confirmar (${selectedFlavors.length} sabores)`}
                  </Button>
                </div>
              </>
            ) : step === 'drinks' && showDrinkStep ? (
              <>
                {/* Selected flavors summary */}
                {selectedFlavors.length > 0 && (
                  <div className="px-4 py-2 bg-muted/50 shrink-0">
                    <span className="text-sm text-muted-foreground">
                      Sabores: {selectedFlavors.join(', ')}
                    </span>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                    Escolha sua bebida
                  </h4>
                  {availableDrinks.map(renderDrinkButton)}
                  
                  {availableDrinks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma bebida disponível
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-background shrink-0 space-y-2">
                  {showFlavorStep && (
                    <Button
                      variant="outline"
                      onClick={() => setStep('flavors')}
                      className="w-full"
                    >
                      Voltar para Sabores
                    </Button>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={!selectedDrink}
                    className="w-full"
                    size="lg"
                  >
                    {(hasPizzaSelection && borderOptions.length > 0) ? 'Próximo: Escolher Borda' : 'Confirmar Combo'}
                  </Button>
                </div>
              </>
            ) : step === 'border' ? (
              <>
                {/* Summary */}
                <div className="px-4 py-2 bg-muted/50 shrink-0 space-y-1">
                  {selectedFlavors.length > 0 && (
                    <span className="text-sm text-muted-foreground block">
                      Sabores: {selectedFlavors.join(', ')}
                    </span>
                  )}
                  {selectedDrink && (
                    <span className="text-sm text-muted-foreground block">
                      Bebida: {selectedDrink}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                    Escolha a borda
                  </h4>
                  <RadioGroup
                    value={selectedBorder?.name || ''}
                    onValueChange={(val) => {
                      const opt = borderOptions.find(o => o.name === val);
                      if (opt) setSelectedBorder({ name: opt.name, price: opt.price });
                    }}
                    className="space-y-2"
                  >
                    {borderOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${
                          selectedBorder?.name === option.name
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={option.name} id={`combo-border-${option.id}`} />
                        <Label htmlFor={`combo-border-${option.id}`} className="flex-1 cursor-pointer">
                          <span className="font-medium">{option.name}</span>
                          {option.price > 0 && (
                            <span className="text-xs text-secondary ml-1">
                              +R$ {option.price.toFixed(2)}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border bg-background shrink-0 space-y-2">
                  {selectedBorder && selectedBorder.price > 0 && (
                    <p className="text-sm text-secondary text-center">
                      Borda: +R$ {selectedBorder.price.toFixed(2)}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setStep(showDrinkStep ? 'drinks' : 'flavors')}
                    className="w-full"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!selectedBorder}
                    className="w-full"
                    size="lg"
                  >
                    Confirmar Combo
                  </Button>
                </div>
              </>
            ) : (
              // No selection needed, just confirm
              <div className="p-4">
                <Button
                  onClick={handleConfirm}
                  className="w-full"
                  size="lg"
                >
                  Adicionar ao Carrinho
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComboFlavorSelector;
