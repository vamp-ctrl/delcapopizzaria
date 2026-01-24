import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Pizza, Package } from 'lucide-react';
import { useDrinks } from '@/hooks/useDrinks';
import { useCombos } from '@/hooks/useCombos';
import { PizzaSize } from '@/types/menu';
import SizeCard from './SizeCard';
import DrinkCard from './DrinkCard';
import ComboCard from './ComboCard';
import FlavorSelector from './FlavorSelector';
import { Input } from '@/components/ui/input';

const PIZZA_SIZES: { key: PizzaSize; label: string }[] = [
  { key: 'P', label: 'Pequena' },
  { key: 'M', label: 'Média' },
  { key: 'G', label: 'Grande' },
  { key: 'GG', label: 'Gigante' }
];

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFlavorSelector, setShowFlavorSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useState<PizzaSize>('M');
  
  const { refrigerantes, sucos, loading: drinksLoading } = useDrinks();
  const { combos, loading: combosLoading } = useCombos();

  const filteredRefrigerantes = refrigerantes.filter(drink =>
    drink.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSucos = sucos.filter(drink =>
    drink.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSizeSelect = (size: PizzaSize) => {
    setSelectedSize(size);
    setShowFlavorSelector(true);
  };

  return (
    <section id="cardapio" className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
            Nosso Cardápio
          </h2>
          <p className="text-muted-foreground">Escolha o tamanho da sua pizza favorita</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar bebidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </motion.div>

        {/* Combos Section */}
        {!combosLoading && combos.length > 0 && (
          <div className="mb-16">
            <h3 className="font-display text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              <Package className="w-6 h-6" />
              Combos Promocionais
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {combos.map((combo, index) => (
                <ComboCard key={combo.id} combo={combo} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Pizza Sizes */}
        <div className="mb-16">
          <h3 className="font-display text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-1 bg-primary rounded-full"></span>
            <Pizza className="w-6 h-6" />
            Pizzas - Escolha o Tamanho
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {PIZZA_SIZES.map((size, index) => (
              <SizeCard
                key={size.key}
                size={size.key}
                label={size.label}
                index={index}
                onSelect={() => handleSizeSelect(size.key)}
              />
            ))}
          </div>
        </div>

        {/* Bebidas */}
        <div>
          <h3 className="font-display text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-1 bg-primary rounded-full"></span>
            Bebidas
          </h3>
          
          {drinksLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Refrigerantes</h4>
                <div className="space-y-3">
                  {filteredRefrigerantes.map((drink, index) => (
                    <DrinkCard key={drink.id} drink={drink} index={index} />
                  ))}
                  {filteredRefrigerantes.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      {searchTerm ? 'Nenhum refrigerante encontrado' : 'Nenhum refrigerante disponível'}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Sucos</h4>
                <div className="space-y-3">
                  {filteredSucos.map((drink, index) => (
                    <DrinkCard key={drink.id} drink={drink} index={index} />
                  ))}
                  {filteredSucos.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      {searchTerm ? 'Nenhum suco encontrado' : 'Nenhum suco disponível'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flavor Selector Modal */}
      <FlavorSelector
        isOpen={showFlavorSelector}
        onClose={() => setShowFlavorSelector(false)}
        selectedSize={selectedSize}
      />
    </section>
  );
};

export default Menu;
