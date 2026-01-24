import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Drink } from '@/types/menu';

interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  is_active: boolean;
  drink_type: string | null;
  size_label: string | null;
  category_id: string | null;
}

const DRINKS_CATEGORY_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export const useDrinks = () => {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrinks = async () => {
    try {
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', DRINKS_CATEGORY_ID)
        .eq('is_active', true)
        .order('name');

      if (prodError) throw prodError;

      const mappedDrinks: Drink[] = (products || []).map((p: DbProduct) => ({
        id: p.id,
        name: p.name,
        type: (p.drink_type as 'refrigerante' | 'suco') || 'refrigerante',
        price: p.base_price,
        size: p.size_label || '',
      }));

      setDrinks(mappedDrinks);
      setError(null);
    } catch (err) {
      console.error('Error fetching drinks:', err);
      setError('Erro ao carregar bebidas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrinks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('drinks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          // Only refetch if it's a drink
          const newRecord = payload.new as DbProduct | undefined;
          const oldRecord = payload.old as DbProduct | undefined;
          if (
            newRecord?.category_id === DRINKS_CATEGORY_ID ||
            oldRecord?.category_id === DRINKS_CATEGORY_ID
          ) {
            fetchDrinks();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refrigerantes = drinks.filter(d => d.type === 'refrigerante');
  const sucos = drinks.filter(d => d.type === 'suco');

  return {
    drinks,
    refrigerantes,
    sucos,
    loading,
    error,
    refetch: fetchDrinks,
  };
};
