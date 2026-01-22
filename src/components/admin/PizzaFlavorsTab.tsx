import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Pizza, Check, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { pizzas as initialPizzas } from '@/data/menu';
import { Pizza as PizzaType } from '@/types/menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface EditablePizza extends PizzaType {
  isActive: boolean;
}

const PizzaFlavorsTab = () => {
  const [pizzaList, setPizzaList] = useState<EditablePizza[]>(
    initialPizzas.map(p => ({ ...p, isActive: true }))
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState<EditablePizza | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPremium: false,
    premiumPrice: 10,
  });

  const handleOpenDialog = (pizza?: EditablePizza) => {
    if (pizza) {
      setEditingPizza(pizza);
      setFormData({
        name: pizza.name,
        description: pizza.description,
        isPremium: pizza.isPremium || false,
        premiumPrice: pizza.premiumPrice || 10,
      });
    } else {
      setEditingPizza(null);
      setFormData({
        name: '',
        description: '',
        isPremium: false,
        premiumPrice: 10,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingPizza) {
      // Update existing
      setPizzaList(prev =>
        prev.map(p =>
          p.id === editingPizza.id
            ? {
                ...p,
                name: formData.name,
                description: formData.description,
                isPremium: formData.isPremium,
                premiumPrice: formData.isPremium ? formData.premiumPrice : undefined,
              }
            : p
        )
      );
      toast.success('Sabor atualizado com sucesso!');
    } else {
      // Create new
      const newPizza: EditablePizza = {
        id: `pizza-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        isPremium: formData.isPremium,
        premiumPrice: formData.isPremium ? formData.premiumPrice : undefined,
        isActive: true,
      };
      setPizzaList(prev => [...prev, newPizza]);
      toast.success('Sabor adicionado com sucesso!');
    }

    setIsDialogOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setPizzaList(prev =>
      prev.map(p => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleDelete = (id: string) => {
    setPizzaList(prev => prev.filter(p => p.id !== id));
    toast.success('Sabor removido com sucesso!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Pizza className="w-5 h-5 text-primary" />
          Sabores de Pizza ({pizzaList.length})
        </h2>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <AnimatePresence>
          {pizzaList.map((pizza, index) => (
            <motion.div
              key={pizza.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border ${
                pizza.isActive
                  ? 'bg-card border-border'
                  : 'bg-muted/50 border-muted opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{pizza.name}</h3>
                    {pizza.isPremium && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        +R$ {pizza.premiumPrice}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {pizza.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={pizza.isActive}
                    onCheckedChange={() => handleToggleActive(pizza.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(pizza)}
                  >
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

      {/* Add/Edit Dialog */}
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
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPremium: checked })
                }
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
                  onChange={(e) =>
                    setFormData({ ...formData, premiumPrice: Number(e.target.value) })
                  }
                />
              </motion.div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Check className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PizzaFlavorsTab;
