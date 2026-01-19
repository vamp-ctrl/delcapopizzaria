import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import { Pizza, PizzaSize, MAX_FLAVORS } from '@/types/menu';
import { pizzas } from '@/data/menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface FlavorSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize: PizzaSize;
  basePrice: number;
}

const FlavorSelector = ({ isOpen, onClose, selectedSize, basePrice }: FlavorSelectorProps) => {
  const [selectedFlavors, setSelectedFlavors] = useState<Pizza[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addItem } = useCart();

  const maxFlavors = MAX_FLAVORS[selectedSize];
  
  const filteredPizzas = pizzas.filter(pizza =>
    pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pizza.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleFlavor = (pizza: Pizza) => {
    const isSelected = selectedFlavors.some(f => f.id === pizza.id);
    
    if (isSelected) {
      setSelectedFlavors(prev => prev.filter(f => f.id !== pizza.id));
    } else {
      if (selectedFlavors.length >= maxFlavors) {
        toast.error(`Máximo de ${maxFlavors} sabores para tamanho ${selectedSize}`);
        return;
      }
      setSelectedFlavors(prev => [...prev, pizza]);
    }
  };

  const handleAddToCart = () => {
    if (selectedFlavors.length === 0) {
      toast.error('Selecione pelo menos um sabor');
      return;
    }

    const flavorNames = selectedFlavors.map(f => f.name);
    const avgPrice = selectedFlavors.reduce((sum, f) => sum + f.prices[selectedSize], 0) / selectedFlavors.length;
    
    addItem({
      id: `pizza-${selectedSize}-${Date.now()}`,
      type: 'pizza',
      name: `Pizza ${selectedSize} - ${flavorNames.join(' / ')}`,
      size: selectedSize,
      price: avgPrice,
      flavors: flavorNames
    });

    toast.success(`Pizza adicionada ao carrinho!`);
    setSelectedFlavors([]);
    setSearchTerm('');
    onClose();
  };

  const handleClose = () => {
    setSelectedFlavors([]);
    setSearchTerm('');
    onClose();
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
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-card border-t border-border rounded-t-2xl shadow-xl overflow-hidden"
          >
            <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between sticky top-0">
              <div>
                <h3 className="font-display font-semibold">Escolha os Sabores</h3>
                <p className="text-sm opacity-90">
                  Tamanho {selectedSize} - Até {maxFlavors} sabor{maxFlavors > 1 ? 'es' : ''}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={handleClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected flavors */}
            {selectedFlavors.length > 0 && (
              <div className="p-4 bg-muted border-b border-border">
                <p className="text-sm font-medium text-foreground mb-2">
                  Selecionados ({selectedFlavors.length}/{maxFlavors}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedFlavors.map(flavor => (
                    <span
                      key={flavor.id}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm flex items-center gap-2"
                    >
                      {flavor.name}
                      <button onClick={() => handleToggleFlavor(flavor)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            <div className="p-4 border-b border-border">
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
            <div className="overflow-y-auto max-h-[40vh] p-4">
              <div className="space-y-2">
                {filteredPizzas.map(pizza => {
                  const isSelected = selectedFlavors.some(f => f.id === pizza.id);
                  return (
                    <motion.button
                      key={pizza.id}
                      onClick={() => handleToggleFlavor(pizza)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{pizza.name}</p>
                          <p className="text-xs text-muted-foreground">{pizza.description}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                        }`}>
                          {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Add to cart button */}
            <div className="p-4 border-t border-border bg-background">
              <Button
                onClick={handleAddToCart}
                disabled={selectedFlavors.length === 0}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar ao Carrinho
                {selectedFlavors.length > 0 && (
                  <span className="ml-2">
                    - R$ {(selectedFlavors.reduce((sum, f) => sum + f.prices[selectedSize], 0) / selectedFlavors.length).toFixed(2)}
                  </span>
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
