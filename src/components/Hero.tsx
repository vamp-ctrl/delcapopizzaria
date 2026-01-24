import { motion } from 'framer-motion';
import heroPizza from '@/assets/hero-pizza.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroPizza}
          alt="Pizza Del Capo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-wood/80 via-wood/60 to-background" />
      </div>
      
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-block">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center shadow-lg"
            >
              <span className="text-primary-foreground font-display font-bold text-4xl">DC</span>
            </motion.div>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream drop-shadow-lg">
            Del Capo
          </h1>
          <p className="font-display text-2xl md:text-3xl text-cheese-light italic">
            Pizzaria
          </p>
          <p className="text-lg text-cream/90 max-w-md mx-auto">
            Qualidade em cada fatia.
          </p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-4"
          >
            <a
              href="#cardapio"
              className="inline-block bg-primary hover:bg-tomato-light text-primary-foreground font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
            >
              Ver Cardápio
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
