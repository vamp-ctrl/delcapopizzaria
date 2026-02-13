import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Pizza, Check, X, Crown, Search, Loader2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  is_active: boolean;
}

interface DbCategory {
  id: string;
  name: string;
}

interface DbBorder {
  id: string;
  name: string;
  price: number;
  is_active: boolean | null;
  display_order: number | null;
}

const PizzaFlavorsTab = () => {
  const [pizzaList, setPizzaList] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [borders, setBorders] = useState<DbBorder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState<DbProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    isPremium: false,
    premiumPrice: 10,
  });

  // Border dialog state
  const [isBorderDialogOpen, setIsBorderDialogOpen] = useState(false);
  const [editingBorder, setEditingBorder] = useState<DbBorder | null>(null);
  const [borderForm, setBorderForm] = useState({ name: '', price: 0 });
  const [savingBorder, setSavingBorder] = useState(false);

  const DRINKS_CATEGORY_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  const fetchData = async () => {
    try {
      const [{ data: products }, { data: cats }, { data: borderData }] = await Promise.all([
        supabase.from('products').select('*').neq('category_id', DRINKS_CATEGORY_ID).order('name'),
        supabase.from('categories').select('id, name').eq('is_active', true).neq('id', DRINKS_CATEGORY_ID).order('display_order'),
        supabase.from('border_options').select('*').order('display_order'),
      ]);

      setPizzaList(products || []);
      setCategories(cats || []);
      setBorders(borderData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Pizza CRUD ---
  const handleOpenDialog = (pizza?: DbProduct) => {
    if (pizza) {
      setEditingPizza(pizza);
      setFormData({
        name: pizza.name,
        description: pizza.description || '',
        category_id: pizza.category_id || '',
        isPremium: pizza.base_price > 0,
        premiumPrice: pizza.base_price > 0 ? pizza.base_price : 10,
      });
    } else {
      setEditingPizza(null);
      setFormData({
        name: '',
        description: '',
        category_id: categories[0]?.id || '',
        isPremium: false,
        premiumPrice: 10,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id || null,
        base_price: formData.isPremium ? formData.premiumPrice : 0,
      };
      if (editingPizza) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingPizza.id);
        if (error) throw error;
        toast.success('Sabor atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        toast.success('Sabor adicionado com sucesso!');
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      setPizzaList(prev => prev.map(p => (p.id === id ? { ...p, is_active: !currentStatus } : p)));
      toast.success(currentStatus ? 'Sabor desativado' : 'Sabor ativado');
    } catch (error) {
      console.error('Error toggling:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setPizzaList(prev => prev.filter(p => p.id !== id));
      toast.success('Sabor removido com sucesso!');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erro ao remover');
    }
  };

  // --- Border CRUD ---
  const handleOpenBorderDialog = (border?: DbBorder) => {
    if (border) {
      setEditingBorder(border);
      setBorderForm({ name: border.name, price: border.price });
    } else {
      setEditingBorder(null);
      setBorderForm({ name: '', price: 0 });
    }
    setIsBorderDialogOpen(true);
  };

  const handleSaveBorder = async () => {
    if (!borderForm.name.trim()) {
      toast.error('Preencha o nome da borda');
      return;
    }
    setSavingBorder(true);
    try {
      if (editingBorder) {
        const { error } = await supabase
          .from('border_options')
          .update({ name: borderForm.name.trim(), price: borderForm.price })
          .eq('id', editingBorder.id);
        if (error) throw error;
        toast.success('Borda atualizada!');
      } else {
        const { error } = await supabase
          .from('border_options')
          .insert({ name: borderForm.name.trim(), price: borderForm.price, display_order: borders.length });
        if (error) throw error;
        toast.success('Borda adicionada!');
      }
      setIsBorderDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving border:', error);
      toast.error('Erro ao salvar borda');
    } finally {
      setSavingBorder(false);
    }
  };

  const handleToggleBorder = async (id: string, currentStatus: boolean | null) => {
    try {
      const { error } = await supabase.from('border_options').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      setBorders(prev => prev.map(b => (b.id === id ? { ...b, is_active: !currentStatus } : b)));
      toast.success(currentStatus ? 'Borda desativada' : 'Borda ativada');
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  const handleDeleteBorder = async (id: string) => {
    try {
      const { error } = await supabase.from('border_options').delete().eq('id', id);
      if (error) throw error;
      setBorders(prev => prev.filter(b => b.id !== id));
      toast.success('Borda removida!');
    } catch (error) {
      toast.error('Erro ao remover borda');
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sem categoria';
  };

  const filteredPizzas = pizzaList.filter(pizza =>
    pizza.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pizza.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="flavors" className="space-y-4">
      <TabsList>
        <TabsTrigger value="flavors" className="flex items-center gap-2">
          <Pizza className="w-4 h-4" />
          Sabores
        </TabsTrigger>
        <TabsTrigger value="borders" className="flex items-center gap-2">
          <Circle className="w-4 h-4" />
          Bordas
        </TabsTrigger>
      </TabsList>

      {/* === SABORES TAB === */}
      <TabsContent value="flavors" className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Pizza className="w-5 h-5 text-primary" />
            Sabores de Pizza ({pizzaList.filter(p => p.is_active).length} ativos)
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar sabor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence>
            {filteredPizzas.map((pizza, index) => (
              <motion.div
                key={pizza.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02 }}
                className={`p-4 rounded-xl border ${
                  pizza.is_active
                    ? 'bg-card border-border'
                    : 'bg-muted/50 border-muted opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold truncate">{pizza.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryName(pizza.category_id)}
                      </Badge>
                      {pizza.base_price > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          +R$ {pizza.base_price}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pizza.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={pizza.is_active}
                      onCheckedChange={() => handleToggleActive(pizza.id, pizza.is_active)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pizza)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(pizza.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPizzas.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm ? 'Nenhum sabor encontrado' : 'Nenhum sabor cadastrado'}
          </p>
        )}
      </TabsContent>

      {/* === BORDAS TAB === */}
      <TabsContent value="borders" className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Circle className="w-5 h-5 text-primary" />
            Opções de Borda ({borders.filter(b => b.is_active).length} ativas)
          </h2>
          <Button onClick={() => handleOpenBorderDialog()} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Borda
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {borders.map((border) => (
            <div
              key={border.id}
              className={`p-4 rounded-xl border flex items-center justify-between ${
                border.is_active
                  ? 'bg-card border-border'
                  : 'bg-muted/50 border-muted opacity-60'
              }`}
            >
              <div>
                <h3 className="font-semibold">{border.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {border.price > 0 ? `R$ ${border.price.toFixed(2)}` : 'Sem custo'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={border.is_active ?? true}
                  onCheckedChange={() => handleToggleBorder(border.id, border.is_active)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleOpenBorderDialog(border)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteBorder(border.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {borders.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhuma borda cadastrada</p>
        )}
      </TabsContent>

      {/* Pizza Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPizza ? 'Editar Sabor' : 'Novo Sabor de Pizza'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Sabor *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Calabresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ingredientes do sabor..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <Label htmlFor="premium" className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  Sabor Premium
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Adiciona valor extra ao preço base
                </p>
              </div>
              <Switch
                id="premium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
              />
            </div>
            {formData.isPremium && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label htmlFor="premiumPrice">Valor Adicional (R$)</Label>
                <Input
                  id="premiumPrice"
                  type="number"
                  min="1"
                  value={formData.premiumPrice}
                  onChange={(e) => setFormData({ ...formData, premiumPrice: Number(e.target.value) })}
                />
              </motion.div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Border Add/Edit Dialog */}
      <Dialog open={isBorderDialogOpen} onOpenChange={setIsBorderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBorder ? 'Editar Borda' : 'Nova Borda'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="borderName">Nome da Borda *</Label>
              <Input
                id="borderName"
                value={borderForm.name}
                onChange={(e) => setBorderForm({ ...borderForm, name: e.target.value })}
                placeholder="Ex: Catupiry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="borderPrice">Preço (R$)</Label>
              <Input
                id="borderPrice"
                type="number"
                min="0"
                step="0.5"
                value={borderForm.price}
                onChange={(e) => setBorderForm({ ...borderForm, price: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBorderDialogOpen(false)} disabled={savingBorder}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveBorder} disabled={savingBorder}>
              {savingBorder ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default PizzaFlavorsTab;
