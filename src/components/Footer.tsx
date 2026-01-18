import { Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-wood text-cream py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">DC</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Del Capo</h3>
                <p className="text-cream/70 text-sm">Pizzaria</p>
              </div>
            </div>
            <p className="text-cream/80 text-sm">
              Tradição e sabor em cada fatia. Desde 2010 fazendo as melhores pizzas da cidade.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/5511999999999"
                className="flex items-center gap-2 text-cream/80 hover:text-cheese transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>(11) 99999-9999</span>
              </a>
              <div className="flex items-center gap-2 text-cream/80">
                <MapPin className="w-4 h-4" />
                <span>Rua da Pizza, 123 - Centro</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Horário</h4>
            <div className="flex items-start gap-2 text-cream/80">
              <Clock className="w-4 h-4 mt-0.5" />
              <div>
                <p>Terça a Domingo</p>
                <p>18h às 23h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-cream/20 text-center text-cream/60 text-sm">
          <p>© 2025 Del Capo Pizzaria. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
