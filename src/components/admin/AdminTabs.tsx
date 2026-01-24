import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Pizza, GlassWater, MessageCircle, Settings, Ticket, Package } from 'lucide-react';
import OrdersTab from './OrdersTab';
import PizzaFlavorsTab from './PizzaFlavorsTab';
import DrinksTab from './DrinksTab';
import ChatTab from './ChatTab';
import StoreSettingsTab from './StoreSettingsTab';
import CouponsTab from './CouponsTab';
import CombosTab from './CombosTab';

const AdminTabs = () => {
  return (
    <Tabs defaultValue="orders" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1 h-auto">
        <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-background">
          <ClipboardList className="w-4 h-4" />
          <span className="hidden sm:inline">Pedidos</span>
        </TabsTrigger>
        <TabsTrigger value="pizzas" className="flex items-center gap-2 data-[state=active]:bg-background">
          <Pizza className="w-4 h-4" />
          <span className="hidden sm:inline">Pizzas</span>
        </TabsTrigger>
        <TabsTrigger value="drinks" className="flex items-center gap-2 data-[state=active]:bg-background">
          <GlassWater className="w-4 h-4" />
          <span className="hidden sm:inline">Bebidas</span>
        </TabsTrigger>
        <TabsTrigger value="combos" className="flex items-center gap-2 data-[state=active]:bg-background">
          <Package className="w-4 h-4" />
          <span className="hidden sm:inline">Combos</span>
        </TabsTrigger>
        <TabsTrigger value="coupons" className="flex items-center gap-2 data-[state=active]:bg-background">
          <Ticket className="w-4 h-4" />
          <span className="hidden sm:inline">Cupons</span>
        </TabsTrigger>
        <TabsTrigger value="chat" className="flex items-center gap-2 data-[state=active]:bg-background">
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Chat</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-background">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Loja</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="orders" className="mt-4">
        <OrdersTab />
      </TabsContent>

      <TabsContent value="pizzas" className="mt-4">
        <PizzaFlavorsTab />
      </TabsContent>

      <TabsContent value="drinks" className="mt-4">
        <DrinksTab />
      </TabsContent>

      <TabsContent value="combos" className="mt-4">
        <CombosTab />
      </TabsContent>

      <TabsContent value="coupons" className="mt-4">
        <CouponsTab />
      </TabsContent>

      <TabsContent value="chat" className="mt-4">
        <ChatTab />
      </TabsContent>

      <TabsContent value="settings" className="mt-4">
        <StoreSettingsTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
