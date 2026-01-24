import { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { BorderOption } from '@/types/menu';
import { Loader2 } from 'lucide-react';

interface BorderSelectorProps {
  value: string | null;
  onChange: (border: { name: string; price: number } | null) => void;
}

const BorderSelector = ({ value, onChange }: BorderSelectorProps) => {
  const [options, setOptions] = useState<BorderOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorders = async () => {
      const { data, error } = await supabase
        .from('border_options')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (!error && data) {
        setOptions(data);
        // Auto-select "Sem borda" by default
        if (!value && data.length > 0) {
          const noBorder = data.find(b => b.price === 0);
          if (noBorder) {
            onChange({ name: noBorder.name, price: 0 });
          }
        }
      }
      setLoading(false);
    };
    fetchBorders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-foreground">Escolha a borda:</Label>
      <RadioGroup
        value={value || ''}
        onValueChange={(val) => {
          const selected = options.find(o => o.name === val);
          if (selected) {
            onChange({ name: selected.name, price: selected.price });
          }
        }}
        className="grid grid-cols-2 gap-2"
      >
        {options.map((option) => (
          <div
            key={option.id}
            className={`flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer ${
              value === option.name
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value={option.name} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              <span className="font-medium">{option.name}</span>
              {option.price > 0 && (
                <span className="text-xs text-secondary ml-1">
                  +R$ {option.price.toFixed(2)}
                </span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default BorderSelector;
