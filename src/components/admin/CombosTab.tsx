import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Trash2, Pencil, Loader2, Pizza, Coffee } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComboItem {
  id?: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
}

interface Combo {
  id: string;
  name: string;
  description: string | null;
  regular_price: number;
  combo_price: number;
  is_active: boolean;
  pizza_size: string | null;
  allowed_flavor_ids: string[] | null;
  allowed_drink_ids: string[] | null;
  free_delivery: boolean;
  pizza_count: number;
  items: ComboItem[];
}

interface Product {
  id: string;
  name: string;
  base_price: number;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const PIZZA_SIZES = ['P', 'M', 'G', 'GG'];

const CombosTab = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pizzaFlavors, setPizzaFlavors] = useState<Product[]>([]);
  const [drinks, setDrinks] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [comboPrice, setComboPrice] = useState('');
  const [pizzaSize, setPizzaSize] = useState<string>('G');
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const [selectedDrinkIds, setSelectedDrinkIds] = useState<string[]>([]);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [pizzaCount, setPizzaCount] = useState(1);
  const [items, setItems] = useState<ComboItem[]>([]);

  useEffect(() => {
    fetchCombos();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true);
    setCategories(data || []);
  };

  const fetchCombos = async () => {
    const { data: combosData, error } = await supabase
      .from('combos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching combos:', error);
      toast.error('Erro ao carregar combos');
      setLoading(false);
      return;
    }

    // Fetch items for each combo
    const combosWithItems = await Promise.all(
      (combosData || []).map(async (combo) => {
        const { data: itemsData } = await supabase
          .from('combo_items')
          .select('*')
          .eq('combo_id', combo.id);
        return { 
          ...combo, 
          items: itemsData || [],
          allowed_flavor_ids: combo.allowed_flavor_ids || [],
          allowed_drink_ids: combo.allowed_drink_ids || [],
          free_delivery: combo.free_delivery ?? false,
          pizza_count: combo.pizza_count ?? 1,
        };
      })
    );

    setCombos(combosWithItems);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name, base_price, category_id')
      .eq('is_active', true)
      .order('name');
    
    setProducts(data || []);
    
    // Separate pizzas and drinks based on category
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true);
    
    const salgadasCat = cats?.find(c => c.name === 'Salgadas');
    const docesCat = cats?.find(c => c.name === 'Doces');
    const drinksCat = cats?.find(c => c.name === 'Bebidas');
    
    const pizzaIds = [salgadasCat?.id, docesCat?.id].filter(Boolean);
    
    setPizzaFlavors((data || []).filter(p => pizzaIds.includes(p.category_id)));
    setDrinks((data || []).filter(p => p.category_id === drinksCat?.id));
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setRegularPrice('');
    setComboPrice('');
    setPizzaSize('G');
    setSelectedFlavorIds([]);
    setSelectedDrinkIds([]);
    setFreeDelivery(false);
    setPizzaCount(1);
    setItems([]);
    setEditingCombo(null);
  };

  const openEditDialog = (combo: Combo) => {
    setEditingCombo(combo);
    setName(combo.name);
    setDescription(combo.description || '');
    setRegularPrice(combo.regular_price.toString());
    setComboPrice(combo.combo_price.toString());
    setPizzaSize(combo.pizza_size || 'G');
    setSelectedFlavorIds(combo.allowed_flavor_ids || []);
    setSelectedDrinkIds(combo.allowed_drink_ids || []);
    setFreeDelivery(combo.free_delivery ?? false);
    setPizzaCount(combo.pizza_count ?? 1);
    setItems(combo.items.map(i => ({
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
    })));
    setDialogOpen(true);
  };

  const addItem = () => {
    setItems([...items, { product_id: null, product_name: '', quantity: 1 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value as string,
        product_name: product?.name || '',
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const toggleFlavorId = (id: string) => {
    setSelectedFlavorIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const toggleDrinkId = (id: string) => {
    setSelectedDrinkIds(prev => 
      prev.includes(id) ? prev.filter(did => did !== id) : [...prev, id]
    );
  };

  const selectAllFlavors = () => {
    setSelectedFlavorIds(pizzaFlavors.map(p => p.id));
    toast.success('Todos os sabores selecionados!');
  };

  const selectAllDrinks = () => {
    setSelectedDrinkIds(drinks.map(d => d.id));
    toast.success('Todas as bebidas selecionadas!');
  };

  const handleSave = async () => {
    if (!name || !comboPrice) {
      toast.error('Preencha nome e preço do combo');
      return;
    }

    if (selectedFlavorIds.length === 0 && selectedDrinkIds.length === 0) {
      toast.error('Selecione pelo menos um sabor ou uma bebida');
      return;
    }

    setSaving(true);

    const comboData = {
      name,
      description: description || null,
      regular_price: parseFloat(regularPrice) || 0,
      combo_price: parseFloat(comboPrice),
      pizza_size: pizzaSize,
      allowed_flavor_ids: selectedFlavorIds.length > 0 ? selectedFlavorIds : null,
      allowed_drink_ids: selectedDrinkIds.length > 0 ? selectedDrinkIds : null,
      free_delivery: freeDelivery,
      pizza_count: pizzaCount,
    };

    try {
      if (editingCombo) {
        const { error } = await supabase
          .from('combos')
          .update(comboData)
          .eq('id', editingCombo.id);

        if (error) throw error;

        // Delete old items and insert new ones
        await supabase.from('combo_items').delete().eq('combo_id', editingCombo.id);
        if (items.length > 0) {
          await supabase.from('combo_items').insert(
            items.map(item => ({
              combo_id: editingCombo.id,
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
            }))
          );
        }

        toast.success('Combo atualizado!');
      } else {
        const { data: newCombo, error } = await supabase
          .from('combos')
          .insert(comboData)
          .select()
          .single();

        if (error) throw error;

        if (items.length > 0) {
          await supabase.from('combo_items').insert(
            items.map(item => ({
              combo_id: newCombo.id,
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
            }))
          );
        }

        toast.success('Combo criado!');
      }

      fetchCombos();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving combo:', error);
      toast.error('Erro ao salvar combo');
    }

    setSaving(false);
  };

  const toggleCombo = async (combo: Combo) => {
    const { error } = await supabase
      .from('combos')
      .update({ is_active: !combo.is_active })
      .eq('id', combo.id);

    if (error) {
      toast.error('Erro ao atualizar combo');
    } else {
      fetchCombos();
    }
  };

  const deleteCombo = async (id: string) => {
    if (!confirm('Deseja excluir este combo?')) return;

    const { error } = await supabase
      .from('combos')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir combo');
    } else {
      toast.success('Combo excluído!');
      fetchCombos();
    }
  };

  const calculateSavings = (regular: number, combo: number) => {
    if (regular <= 0) return 0;
    return Math.round(((regular - combo) / regular) * 100);
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
          <Package className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Combos Promocionais</h2>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Combo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCombo ? 'Editar Combo' : 'Novo Combo'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Combo</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Combo Pizza + Coca-Cola"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tamanho da Pizza</Label>
                  <Select value={pizzaSize} onValueChange={setPizzaSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIZZA_SIZES.map(size => (
                        <SelectItem key={size} value={size}>
                          {size === 'P' ? 'Pequena (P)' : size === 'M' ? 'Média (M)' : size === 'G' ? 'Grande (G)' : 'Gigante (GG)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pizza grande + 2 litros de Coca-Cola"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço Original</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value)}
                      placeholder="100.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preço do Combo</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      value={comboPrice}
                      onChange={(e) => setComboPrice(e.target.value)}
                      placeholder="85.00"
                    />
                  </div>
                </div>
              </div>

              {/* Pizza count and Free delivery */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Qtd. de Pizzas</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={pizzaCount}
                    onChange={(e) => setPizzaCount(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantidade de pizzas que o cliente pode escolher
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Entrega Grátis</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <Switch
                      checked={freeDelivery}
                      onCheckedChange={setFreeDelivery}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {freeDelivery ? 'Sim' : 'Não'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Taxa de entrega R$ 0,00
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs for Flavors and Drinks */}
              <Tabs defaultValue="flavors" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="flavors" className="gap-2">
                    <Pizza className="w-4 h-4" />
                    Sabores ({selectedFlavorIds.length})
                  </TabsTrigger>
                  <TabsTrigger value="drinks" className="gap-2">
                    <Coffee className="w-4 h-4" />
                    Bebidas ({selectedDrinkIds.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="flavors" className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Sabores Permitidos</Label>
                    <Button type="button" variant="outline" size="sm" onClick={selectAllFlavors}>
                      Selecionar Todos
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione quais sabores o cliente pode escolher neste combo
                  </p>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {pizzaFlavors.map(flavor => (
                      <div key={flavor.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`flavor-${flavor.id}`}
                          checked={selectedFlavorIds.includes(flavor.id)}
                          onCheckedChange={() => toggleFlavorId(flavor.id)}
                        />
                        <label htmlFor={`flavor-${flavor.id}`} className="text-sm flex-1 cursor-pointer">
                          {flavor.name}
                          {flavor.base_price > 0 && (
                            <span className="text-amber-600 ml-1">(+R${flavor.base_price})</span>
                          )}
                        </label>
                      </div>
                    ))}
                    {pizzaFlavors.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum sabor cadastrado
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="drinks" className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Bebidas Permitidas</Label>
                    <Button type="button" variant="outline" size="sm" onClick={selectAllDrinks}>
                      Selecionar Todas
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione quais bebidas o cliente pode escolher (ex: Coca-Cola Original ou Zero)
                  </p>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {drinks.map(drink => (
                      <div key={drink.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`drink-${drink.id}`}
                          checked={selectedDrinkIds.includes(drink.id)}
                          onCheckedChange={() => toggleDrinkId(drink.id)}
                        />
                        <label htmlFor={`drink-${drink.id}`} className="text-sm flex-1 cursor-pointer">
                          {drink.name}
                        </label>
                      </div>
                    ))}
                    {drinks.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma bebida cadastrada
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Optional: Display items (for legacy combos) */}
              {items.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label>Itens do Combo (legado)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="w-4 h-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16"
                        min={1}
                      />
                      <span className="text-muted-foreground">x</span>
                      <Select
                        value={item.product_id || ''}
                        onValueChange={(value) => updateItem(index, 'product_id', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingCombo ? 'Salvar Alterações' : 'Criar Combo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {combos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum combo cadastrado</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {combos.map((combo) => {
              const savings = calculateSavings(combo.regular_price, combo.combo_price);
              return (
                <motion.div
                  key={combo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`p-4 rounded-xl border ${
                    combo.is_active
                      ? 'border-secondary bg-secondary/5'
                      : 'border-border bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-lg">{combo.name}</span>
                        {savings > 0 && (
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                            -{savings}%
                          </Badge>
                        )}
                        {combo.free_delivery && (
                          <Badge className="bg-green-500 text-white">Entrega Grátis</Badge>
                        )}
                        {combo.pizza_count > 1 && (
                          <Badge variant="outline">{combo.pizza_count} Pizzas</Badge>
                        )}
                        {combo.pizza_size && (
                          <Badge variant="outline">Pizza {combo.pizza_size}</Badge>
                        )}
                      </div>
                      {combo.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {combo.description}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={combo.is_active}
                      onCheckedChange={() => toggleCombo(combo)}
                    />
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    {combo.regular_price > 0 && (
                      <span className="text-sm text-muted-foreground line-through">
                        R$ {combo.regular_price.toFixed(2)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-primary">
                      R$ {combo.combo_price.toFixed(2)}
                    </span>
                  </div>

                  {/* Show allowed flavors/drinks count */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(combo.allowed_flavor_ids?.length || 0) > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Pizza className="w-3 h-3" />
                        {combo.allowed_flavor_ids?.length} sabores
                      </Badge>
                    )}
                    {(combo.allowed_drink_ids?.length || 0) > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Coffee className="w-3 h-3" />
                        {combo.allowed_drink_ids?.length} bebidas
                      </Badge>
                    )}
                  </div>

                  {combo.items.length > 0 && (
                    <div className="text-sm text-muted-foreground border-t border-border pt-3 mb-3">
                      <p className="font-medium mb-1">Itens inclusos:</p>
                      <ul className="space-y-1">
                        {combo.items.map((item, i) => (
                          <li key={i}>• {item.quantity}x {item.product_name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(combo)}
                      className="flex-1"
                    >
                      <Pencil className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCombo(combo.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CombosTab;
