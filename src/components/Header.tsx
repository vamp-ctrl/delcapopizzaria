import { motion } from 'framer-motion';
import { ShoppingCart, Phone } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onCartClick: () => void;
}

const Header = ({ onCartClick }: HeaderProps) => {
  const { itemCount } = useCart();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-xl">DC</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Del Capo</h1>
            <p className="text-xs text-muted-foreground">Pizzaria</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>(11) 99999-9999</span>
          </a>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onCartClick}
            className="relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold"
              >
                {itemCount}
              </motion.span>
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
