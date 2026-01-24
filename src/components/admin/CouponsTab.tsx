import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Plus, Trash2, Pencil, Calendar, Percent, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at: string | null;
}

const CouponsTab = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Erro ao carregar cupons');
    } else {
      setCoupons((data || []).map(c => ({
        ...c,
        discount_type: c.discount_type as 'percentage' | 'fixed',
      })));
    }
    setLoading(false);
  };

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinOrderValue('');
    setMaxUses('');
    setExpiresAt('');
    setEditingCoupon(null);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value.toString());
    setMinOrderValue(coupon.min_order_value.toString());
    setMaxUses(coupon.max_uses?.toString() || '');
    setExpiresAt(coupon.expires_at ? coupon.expires_at.split('T')[0] : '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!code || !discountValue) {
      toast.error('Preencha código e valor do desconto');
      return;
    }

    setSaving(true);

    const couponData = {
      code: code.toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order_value: parseFloat(minOrderValue) || 0,
      max_uses: maxUses ? parseInt(maxUses) : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);

      if (error) {
        toast.error('Erro ao atualizar cupom');
      } else {
        toast.success('Cupom atualizado!');
        fetchCoupons();
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('coupons')
        .insert(couponData);

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe um cupom com este código');
        } else {
          toast.error('Erro ao criar cupom');
        }
      } else {
        toast.success('Cupom criado!');
        fetchCoupons();
        setDialogOpen(false);
        resetForm();
      }
    }

    setSaving(false);
  };

  const toggleCoupon = async (coupon: Coupon) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);

    if (error) {
      toast.error('Erro ao atualizar cupom');
    } else {
      fetchCoupons();
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Deseja excluir este cupom?')) return;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir cupom');
    } else {
      toast.success('Cupom excluído!');
      fetchCoupons();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Cupons de Desconto</h2>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Código do Cupom</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="DESCONTO10"
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Desconto</Label>
                <RadioGroup
                  value={discountType}
                  onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage" className="flex items-center gap-1">
                      <Percent className="w-4 h-4" /> Porcentagem
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed" className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> Valor Fixo
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Valor do Desconto</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? '10' : '15.00'}
                  />
                  <span className="text-muted-foreground">
                    {discountType === 'percentage' ? '%' : 'R$'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pedido Mínimo (opcional)</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">R$</span>
                  <Input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="50.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Limite de Usos (opcional)</Label>
                <Input
                  type="number"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label>Data de Expiração (opcional)</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingCoupon ? 'Salvar Alterações' : 'Criar Cupom'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum cupom cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {coupons.map((coupon) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-4 rounded-xl border ${
                  coupon.is_active
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg">{coupon.code}</span>
                      <Badge variant={coupon.is_active ? 'default' : 'secondary'}>
                        {coupon.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}% OFF`
                        : `R$ ${coupon.discount_value.toFixed(2)} OFF`}
                    </p>
                  </div>
                  <Switch
                    checked={coupon.is_active}
                    onCheckedChange={() => toggleCoupon(coupon)}
                  />
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  {coupon.min_order_value > 0 && (
                    <p>Pedido mínimo: R$ {coupon.min_order_value.toFixed(2)}</p>
                  )}
                  {coupon.max_uses && (
                    <p>Usos: {coupon.uses_count}/{coupon.max_uses}</p>
                  )}
                  {coupon.expires_at && (
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expira: {format(new Date(coupon.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(coupon)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCoupon(coupon.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CouponsTab;
