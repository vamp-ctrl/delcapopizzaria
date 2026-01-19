import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Phone, MapPin, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const InfoButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-4 left-4 z-40 w-12 h-12 rounded-full bg-muted text-muted-foreground shadow-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
      >
        <HelpCircle className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-4 bottom-20 z-50 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
                <h3 className="font-display font-semibold">Informações</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {/* Contact */}
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Telefone</p>
                    <a 
                      href="tel:+5569993618962"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      (69) 99361-8962
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Endereço</p>
                    <p className="text-sm text-muted-foreground">
                      Rua Principal, 123 - Centro<br />
                      Porto Velho - RO
                    </p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Formas de Pagamento</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> PIX
                      </span>
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> Crédito
                      </span>
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> Débito
                      </span>
                      <span className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> Dinheiro
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Horário:</span> Ter a Dom, 18h às 23h
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default InfoButton;
