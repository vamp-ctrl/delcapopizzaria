import { motion } from 'framer-motion';
import { pizzas, drinks } from '@/data/menu';
import PizzaCard from './PizzaCard';
import DrinkCard from './DrinkCard';

const Menu = () => {
  const refrigerantes = drinks.filter(d => d.type === 'refrigerante');
  const sucos = drinks.filter(d => d.type === 'suco');

  return (
    <section id="cardapio" className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
            Nosso Cardápio
          </h2>
          <p className="text-muted-foreground">Escolha sua pizza favorita</p>
        </motion.div>

        {/* Pizzas */}
        <div className="mb-16">
          <h3 className="font-display text-2xl font-semibold text-primary mb-6 flex items-center gap-2">
            <span className="w-8 h-1 bg-primary rounded-full"></span>
            Pizzas
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pizzas.map((pizza, index) => (
              <PizzaCard key={pizza.id} pizza={pizza} index={index} />
            ))}
          </div>
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
                {refrigerantes.map((drink, index) => (
                  <DrinkCard key={drink.id} drink={drink} index={index} />
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Sucos</h4>
              <div className="space-y-3">
                {sucos.map((drink, index) => (
                  <DrinkCard key={drink.id} drink={drink} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;
