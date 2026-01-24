import { Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">DC</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Del Capo</h3>
                <p className="text-background/70 text-sm">Pizzaria</p>
              </div>
            </div>
            <p className="text-background/80 text-sm">
              Qualidade em cada fatia.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/5569992517150"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-background/80 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>+55 (69) 9 9251-7150</span>
              </a>
              <div className="flex items-center gap-2 text-background/80">
                <MapPin className="w-4 h-4" />
                <span>Av. Curitiba, 3482 - Jardim Primavera, Vilhena - RO</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Horário</h4>
            <div className="flex items-start gap-2 text-background/80">
              <Clock className="w-4 h-4 mt-0.5" />
              <div>
                <p>Terça a Domingo</p>
                <p>17:30h às 23:30h</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-background/20 text-center text-background/60 text-sm">
          <p>© 2025 Del Capo Pizzaria. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
