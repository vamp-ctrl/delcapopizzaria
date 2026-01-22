import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, GlassWater, Check, X, Coffee, Wine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { drinks as initialDrinks } from '@/data/menu';
import { Drink } from '@/types/menu';
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

interface EditableDrink extends Drink {
  isActive: boolean;
}

const DrinksTab = () => {
  const [drinkList, setDrinkList] = useState<EditableDrink[]>(
    initialDrinks.map(d => ({ ...d, isActive: true }))
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState<EditableDrink | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'refrigerante' as 'refrigerante' | 'suco',
    price: 0,
    size: '',
  });

  const handleOpenDialog = (drink?: EditableDrink) => {
    if (drink) {
      setEditingDrink(drink);
      setFormData({
        name: drink.name,
        type: drink.type,
        price: drink.price,
        size: drink.size,
      });
    } else {
      setEditingDrink(null);
      setFormData({
        name: '',
        type: 'refrigerante',
        price: 0,
        size: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.size.trim() || formData.price <= 0) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    if (editingDrink) {
      setDrinkList(prev =>
        prev.map(d =>
          d.id === editingDrink.id
            ? { ...d, ...formData }
            : d
        )
      );
      toast.success('Bebida atualizada com sucesso!');
    } else {
      const newDrink: EditableDrink = {
        id: `drink-${Date.now()}`,
        ...formData,
        isActive: true,
      };
      setDrinkList(prev => [...prev, newDrink]);
      toast.success('Bebida adicionada com sucesso!');
    }

    setIsDialogOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setDrinkList(prev =>
      prev.map(d => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const handleDelete = (id: string) => {
    setDrinkList(prev => prev.filter(d => d.id !== id));
    toast.success('Bebida removida com sucesso!');
  };

  const refrigerantes = drinkList.filter(d => d.type === 'refrigerante');
  const sucos = drinkList.filter(d => d.type === 'suco');

  const DrinkSection = ({ title, icon: Icon, drinks }: { title: string; icon: typeof GlassWater; drinks: EditableDrink[] }) => (
    <div className="space-y-3">
      <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4" />
        {title} ({drinks.length})
      </h3>
      <div className="grid gap-2">
        <AnimatePresence>
          {drinks.map((drink, index) => (
            <motion.div
              key={drink.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
              className={`p-3 rounded-lg border flex items-center justify-between ${
                drink.isActive
                  ? 'bg-card border-border'
                  : 'bg-muted/50 border-muted opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{drink.name}</p>
                  <p className="text-xs text-muted-foreground">{drink.size}</p>
                </div>
                <Badge variant="outline">R$ {drink.price.toFixed(2)}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={drink.isActive}
                  onCheckedChange={() => handleToggleActive(drink.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(drink)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(drink.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GlassWater className="w-5 h-5 text-primary" />
          Bebidas ({drinkList.length})
        </h2>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      <DrinkSection title="Refrigerantes" icon={Wine} drinks={refrigerantes} />
      <DrinkSection title="Sucos" icon={Coffee} drinks={sucos} />

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDrink ? 'Editar Bebida' : 'Nova Bebida'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Coca-Cola"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'refrigerante' | 'suco') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refrigerante">Refrigerante</SelectItem>
                  <SelectItem value="suco">Suco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamanho *</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="Ex: Lata 350ml"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
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

export default DrinksTab;
