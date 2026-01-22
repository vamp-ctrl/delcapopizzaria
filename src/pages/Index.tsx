import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Menu from '@/components/Menu';
import CartDrawer from '@/components/CartDrawer';
import Chat from '@/components/Chat';
import WhatsAppButton from '@/components/WhatsAppButton';
import InfoButton from '@/components/InfoButton';
import Footer from '@/components/Footer';

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <main className="pt-16">
        <Hero />
        <Menu />
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Chat />
      <WhatsAppButton />
      <InfoButton />
    </div>
  );
};

export default Index;
