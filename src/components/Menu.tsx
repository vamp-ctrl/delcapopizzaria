import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { pizzas, drinks } from '@/data/menu';
import { PizzaSize } from '@/types/menu';
import PizzaCard from './PizzaCard';
import DrinkCard from './DrinkCard';
import PizzaSizeSelector from './PizzaSizeSelector';
import FlavorSelector from './FlavorSelector';
import { Input } from '@/components/ui/input';

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showFlavorSelector, setShowFlavorSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useState<PizzaSize>('M');

  const refrigerantes = drinks.filter(d => d.type === 'refrigerante');
  const sucos = drinks.filter(d => d.type === 'suco');

  // Calculate average prices for size selector
  const avgPrices = {
    P: pizzas.reduce((sum, p) => sum + p.prices.P, 0) / pizzas.length,
    M: pizzas.reduce((sum, p) => sum + p.prices.M, 0) / pizzas.length,
    G: pizzas.reduce((sum, p) => sum + p.prices.G, 0) / pizzas.length,
    GG: pizzas.reduce((sum, p) => sum + p.prices.GG, 0) / pizzas.length
  };

  const filteredPizzas = pizzas.filter(pizza =>
    pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pizza.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRefrigerantes = refrigerantes.filter(drink =>
    drink.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSucos = sucos.filter(drink =>
    drink.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSizeSelect = (size: PizzaSize) => {
    setSelectedSize(size);
    setShowSizeSelector(false);
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
          <p className="text-muted-foreground">Escolha sua pizza favorita</p>
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
              placeholder="Buscar pizzas, bebidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </motion.div>

        {/* Pizzas */}
        <div className="mb-16">
          <h3 className="font-display text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-1 bg-primary rounded-full"></span>
            Pizzas
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPizzas.map((pizza, index) => (
              <PizzaCard 
                key={pizza.id} 
                pizza={pizza} 
                index={index}
                onOrderClick={() => setShowSizeSelector(true)}
              />
            ))}
          </div>
          {filteredPizzas.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma pizza encontrada
            </p>
          )}
        </div>

        {/* Bebidas */}
        <div>
          <h3 className="font-display text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-1 bg-primary rounded-full"></span>
            Bebidas
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Refrigerantes</h4>
              <div className="space-y-3">
                {filteredRefrigerantes.map((drink, index) => (
                  <DrinkCard key={drink.id} drink={drink} index={index} />
                ))}
                {filteredRefrigerantes.length === 0 && searchTerm && (
                  <p className="text-muted-foreground text-sm">Nenhum refrigerante encontrado</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Sucos</h4>
              <div className="space-y-3">
                {filteredSucos.map((drink, index) => (
                  <DrinkCard key={drink.id} drink={drink} index={index} />
                ))}
                {filteredSucos.length === 0 && searchTerm && (
                  <p className="text-muted-foreground text-sm">Nenhum suco encontrado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Selector Modal */}
      <PizzaSizeSelector
        isOpen={showSizeSelector}
        onClose={() => setShowSizeSelector(false)}
        onSelectSize={handleSizeSelect}
        prices={avgPrices}
      />

      {/* Flavor Selector Modal */}
      <FlavorSelector
        isOpen={showFlavorSelector}
        onClose={() => setShowFlavorSelector(false)}
        selectedSize={selectedSize}
        basePrice={avgPrices[selectedSize]}
      />
    </section>
  );
};

export default Menu;
