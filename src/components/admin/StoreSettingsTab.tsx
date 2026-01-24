import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Power, Clock, Calendar, Truck, Package, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface StoreSettings {
  id: string;
  is_open: boolean;
  open_time: string;
  close_time: string;
  closed_days: number[];
  manual_override: boolean;
  delivery_time_minutes: number;
  pickup_time_minutes: number;
  minimum_order: number;
  delivery_fee: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

const StoreSettingsTab = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
    } else {
      setSettings(data);
    }
    setLoading(false);
  };

  const updateSettings = async (updates: Partial<StoreSettings>) => {
    if (!settings || !user) return;

    setSaving(true);
    const { error } = await supabase
      .from('store_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', settings.id);

    if (error) {
      toast.error('Erro ao salvar configurações');
      console.error(error);
    } else {
      setSettings({ ...settings, ...updates });
      toast.success('Configurações salvas!');
    }
    setSaving(false);
  };

  const toggleStoreStatus = () => {
    if (!settings) return;
    updateSettings({
      is_open: !settings.is_open,
      manual_override: true,
    });
  };

  const toggleClosedDay = (day: number) => {
    if (!settings) return;
    const newDays = settings.closed_days.includes(day)
      ? settings.closed_days.filter(d => d !== day)
      : [...settings.closed_days, day];
    updateSettings({ closed_days: newDays });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Erro ao carregar configurações
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Store className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Configurações da Loja</h2>
      </div>

      {/* Store Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl border-2 ${
          settings.is_open
            ? 'border-green-500 bg-green-500/10'
            : 'border-red-500 bg-red-500/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                settings.is_open ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <Power className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {settings.is_open ? 'Loja Aberta' : 'Loja Fechada'}
              </h3>
              <p className="text-muted-foreground">
                {settings.is_open
                  ? 'Aceitando pedidos normalmente'
                  : 'Não está aceitando pedidos'}
              </p>
              {settings.manual_override && (
                <Badge variant="secondary" className="mt-2">
                  Controle manual ativo
                </Badge>
              )}
            </div>
          </div>

          <Button
            size="lg"
            variant={settings.is_open ? 'destructive' : 'default'}
            onClick={toggleStoreStatus}
            disabled={saving}
            className="min-w-[140px]"
          >
            {settings.is_open ? 'Fechar Loja' : 'Abrir Loja'}
          </Button>
        </div>
      </motion.div>

      {/* Operating Hours */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 rounded-xl border border-border bg-card space-y-4"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Horário de Funcionamento</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="open_time">Abre às</Label>
            <Input
              id="open_time"
              type="time"
              value={settings.open_time}
              onChange={(e) => updateSettings({ open_time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="close_time">Fecha às</Label>
            <Input
              id="close_time"
              type="time"
              value={settings.close_time}
              onChange={(e) => updateSettings({ close_time: e.target.value })}
            />
          </div>
        </div>
      </motion.div>

      {/* Closed Days */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl border border-border bg-card space-y-4"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Dias de Folga</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DAYS_OF_WEEK.map(day => (
            <Button
              key={day.value}
              variant={settings.closed_days.includes(day.value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleClosedDay(day.value)}
              className="w-full"
            >
              {day.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Clique nos dias em que a loja permanece fechada
        </p>
      </motion.div>

      {/* Delivery & Pickup Times */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl border border-border bg-card space-y-4"
      >
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Tempos, Taxa e Pedido Mínimo</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="delivery_time" className="flex items-center gap-2">
              <Truck className="w-4 h-4" /> Tempo de entrega
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="delivery_time"
                type="number"
                min="1"
                value={settings.delivery_time_minutes}
                onChange={(e) => updateSettings({ delivery_time_minutes: parseInt(e.target.value) || 45 })}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">minutos</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup_time" className="flex items-center gap-2">
              <Package className="w-4 h-4" /> Tempo de retirada
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="pickup_time"
                type="number"
                min="1"
                value={settings.pickup_time_minutes}
                onChange={(e) => updateSettings({ pickup_time_minutes: parseInt(e.target.value) || 20 })}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">minutos</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_fee" className="flex items-center gap-2">
              <Truck className="w-4 h-4" /> Taxa de entrega
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">R$</span>
              <Input
                id="delivery_fee"
                type="number"
                min="0"
                step="0.01"
                value={settings.delivery_fee}
                onChange={(e) => updateSettings({ delivery_fee: parseFloat(e.target.value) || 0 })}
                className="w-24"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum_order" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Pedido mínimo
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">R$</span>
              <Input
                id="minimum_order"
                type="number"
                min="0"
                step="0.01"
                value={settings.minimum_order}
                onChange={(e) => updateSettings({ minimum_order: parseFloat(e.target.value) || 0 })}
                className="w-24"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Esses valores serão exibidos para os clientes no checkout
        </p>
      </motion.div>

      {/* Auto Mode */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Modo Automático</h3>
            <p className="text-sm text-muted-foreground">
              A loja abre e fecha automaticamente com base no horário configurado
            </p>
          </div>
          <Switch
            checked={!settings.manual_override}
            onCheckedChange={(checked) => updateSettings({ manual_override: !checked })}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default StoreSettingsTab;
