import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Search, Check, AlertCircle, Star, Cookie, Flame, Loader2 } from 'lucide-react';
import { Pizza, PizzaSize, MAX_FLAVORS, SIZE_PRICES } from '@/types/menu';
import { usePizzas } from '@/hooks/usePizzas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import BorderSelector from './BorderSelector';

interface FlavorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize: PizzaSize;
}

const SIZE_LABELS: Record<PizzaSize, string> = {
  P: 'Pequena',
  M: 'Média',
  G: 'Grande',
  GG: 'Gigante'
};

const FlavorSelector = ({ isOpen, onClose, selectedSize }: FlavorSelectorProps) => {
  const [selectedFlavors, setSelectedFlavors] = useState<Pizza[]>([]);
  const [selectedBorder, setSelectedBorder] = useState<{ name: string; price: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCart();
  const { pizzasSalgadas, pizzasDoces, loading } = usePizzas();

  const maxFlavors = MAX_FLAVORS[selectedSize];
  const isAtLimit = selectedFlavors.length >= maxFlavors;
  
  const filterPizzas = (pizzas: Pizza[]) =>
    pizzas.filter(pizza =>
      pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pizza.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredSalgadas = filterPizzas(pizzasSalgadas);
  const filteredDoces = filterPizzas(pizzasDoces);

  const handleToggleFlavor = (pizza: Pizza) => {
    const isSelected = selectedFlavors.some(f => f.id === pizza.id);
    
    if (isSelected) {
      setSelectedFlavors(prev => prev.filter(f => f.id !== pizza.id));
    } else {
      if (isAtLimit) {
        return; // Block selection - button is already disabled
      }
      setSelectedFlavors(prev => [...prev, pizza]);
    }
  };

  const calculatePrice = () => {
    const basePrice = SIZE_PRICES[selectedSize];
    const premiumTotal = selectedFlavors
      .filter(f => f.isPremium)
      .reduce((sum, f) => sum + (f.premiumPrice || 0), 0);
    const borderPrice = selectedBorder?.price || 0;
    return basePrice + premiumTotal + borderPrice;
  };

  const getPremiumTotal = () => {
    return selectedFlavors
      .filter(f => f.isPremium)
      .reduce((sum, f) => sum + (f.premiumPrice || 0), 0);
  };

  const handleAddToCart = () => {
    if (selectedFlavors.length === 0) {
      toast.error('Selecione pelo menos um sabor');
      return;
    }

    const flavorNames = selectedFlavors.map(f => f.name);
    const price = calculatePrice();
    const borderName = selectedBorder?.name !== 'Sem borda' ? selectedBorder?.name : undefined;
    
    addItem({
      id: `pizza-${selectedSize}-${Date.now()}`,
      type: 'pizza',
      name: `Pizza ${SIZE_LABELS[selectedSize]} (${selectedSize}) - ${flavorNames.join(' / ')}${borderName ? ` | Borda ${borderName}` : ''}`,
      size: selectedSize,
      price: price,
      flavors: flavorNames,
      border: borderName,
      borderPrice: selectedBorder?.price || 0,
    });

    toast.success(`Pizza ${SIZE_LABELS[selectedSize]} adicionada ao carrinho!`);
    setSelectedFlavors([]);
    setSelectedBorder(null);
    setSearchTerm('');
    onClose();
  };

  const handleClose = () => {
    setSelectedFlavors([]);
    setSelectedBorder(null);
    setSearchTerm('');
    onClose();
  };

  const renderPizzaCard = (pizza: Pizza) => {
    const isSelected = selectedFlavors.some(f => f.id === pizza.id);
    const isDisabled = !isSelected && isAtLimit;
    
    return (
      <motion.button
        key={pizza.id}
        onClick={() => !isDisabled && handleToggleFlavor(pizza)}
        disabled={isDisabled}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
          isSelected
            ? pizza.isPremium 
              ? 'border-secondary bg-secondary/10 shadow-md'
              : 'border-primary bg-primary/10 shadow-md'
            : isDisabled
            ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
            : 'border-border hover:border-primary/50 bg-background hover:shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-semibold ${isDisabled ? 'text-muted-foreground' : 'text-foreground'}`}>
                {pizza.name}
              </p>
              {pizza.isPremium && (
                <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Especial
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {pizza.description}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {pizza.isPremium ? (
              <span className="text-sm font-bold text-secondary">
                +R$ {pizza.premiumPrice?.toFixed(2)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Incluso
              </span>
            )}
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? pizza.isPremium 
                  ? 'bg-secondary border-secondary' 
                  : 'bg-primary border-primary'
                : isDisabled 
                ? 'border-muted-foreground/30'
                : 'border-muted-foreground'
            }`}>
              {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-card border-t border-border rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display text-lg font-bold">
                  Pizza {SIZE_LABELS[selectedSize]} ({selectedSize})
                </h3>
                <p className="text-sm opacity-90">
                  Escolha até {maxFlavors} sabor{maxFlavors > 1 ? 'es' : ''} • R$ {SIZE_PRICES[selectedSize].toFixed(2)}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Flavor Counter - Always visible */}
            <div className="px-4 py-3 bg-muted border-b border-border shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    Sabores selecionados:
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: maxFlavors }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          i < selectedFlavors.length
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-muted-foreground/30'
                        }`}
                      >
                        {i < selectedFlavors.length ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-xs text-muted-foreground">{i + 1}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <span className={`text-lg font-bold ${isAtLimit ? 'text-secondary' : 'text-foreground'}`}>
                  {selectedFlavors.length}/{maxFlavors}
                </span>
              </div>
              
              {/* Limit reached message */}
              {isAtLimit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 flex items-center gap-2 text-secondary text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Limite de sabores atingido!</span>
                </motion.div>
              )}
            </div>

            {/* Selected flavors chips */}
            {selectedFlavors.length > 0 && (
              <div className="px-4 py-3 border-b border-border shrink-0 bg-background">
                <div className="flex flex-wrap gap-2">
                  {selectedFlavors.map(flavor => (
                    <motion.span
                      key={flavor.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${
                        flavor.isPremium 
                          ? 'bg-secondary text-secondary-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {flavor.isPremium && <Star className="w-3 h-3" />}
                      {flavor.name}
                      {flavor.isPremium && <span className="text-xs">(+R${flavor.premiumPrice})</span>}
                      <button 
                        onClick={() => handleToggleFlavor(flavor)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="p-4 border-b border-border shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar sabor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Flavors list */}
            <div className="overflow-y-auto flex-1 p-4 pb-24">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Salgadas Section */}
                  {filteredSalgadas.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background py-2 z-10">
                        <Flame className="w-5 h-5 text-primary" />
                        <h4 className="font-display font-bold text-foreground">Salgadas</h4>
                        <span className="text-xs text-muted-foreground">({filteredSalgadas.length} sabores)</span>
                      </div>
                      <div className="space-y-2">
                        {filteredSalgadas.map(pizza => renderPizzaCard(pizza))}
                      </div>
                    </div>
                  )}

                  {/* Doces Section */}
                  {filteredDoces.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background py-2 z-10">
                        <Cookie className="w-5 h-5 text-secondary" />
                        <h4 className="font-display font-bold text-foreground">Doces</h4>
                        <span className="text-xs text-muted-foreground">({filteredDoces.length} sabores)</span>
                      </div>
                      <div className="space-y-2">
                        {filteredDoces.map(pizza => renderPizzaCard(pizza))}
                      </div>
                    </div>
                  )}

                  {filteredSalgadas.length === 0 && filteredDoces.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum sabor encontrado
                    </p>
                  )}

                  {/* Border Selector - MOVED TO BOTTOM OF LIST */}
                  <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border">
                    <h4 className="font-display font-bold text-foreground mb-3">Escolha a Borda</h4>
                    <BorderSelector
                      value={selectedBorder?.name || null}
                      onChange={setSelectedBorder}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Summary and Add to cart */}
            <div className="p-4 border-t border-border bg-background shrink-0 space-y-3">
              {/* Order Summary */}
              {selectedFlavors.length > 0 && (
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium text-foreground">Resumo do pedido:</p>
                  <p className="text-xs text-muted-foreground">
                    Pizza {SIZE_LABELS[selectedSize]} ({selectedSize}) - {selectedFlavors.map(f => f.name).join(' / ')}
                    {selectedBorder && selectedBorder.name !== 'Sem borda' && ` | Borda ${selectedBorder.name}`}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço base:</span>
                    <span className="font-medium">R$ {SIZE_PRICES[selectedSize].toFixed(2)}</span>
                  </div>
                  {getPremiumTotal() > 0 && (
                    <div className="flex justify-between text-sm text-secondary">
                      <span>Sabores especiais:</span>
                      <span className="font-medium">+R$ {getPremiumTotal().toFixed(2)}</span>
                    </div>
                  )}
                  {selectedBorder && selectedBorder.price > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Borda {selectedBorder.name}:</span>
                      <span className="font-medium">+R$ {selectedBorder.price.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
              
              <Button
                onClick={handleAddToCart}
                disabled={selectedFlavors.length === 0}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {selectedFlavors.length === 0 ? (
                  'Selecione os sabores'
                ) : (
                  <>
                    Confirmar Pizza - R$ {calculatePrice().toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FlavorSelector;
