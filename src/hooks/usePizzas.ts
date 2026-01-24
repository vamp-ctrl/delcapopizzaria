import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pizza } from '@/types/menu';

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

export const usePizzas = () => {
  const [pizzasSalgadas, setPizzasSalgadas] = useState<Pizza[]>([]);
  const [pizzasDoces, setPizzasDoces] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPizzas = async () => {
    try {
      // Fetch categories
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true);

      if (catError) throw catError;

      // Fetch active products
      const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (prodError) throw prodError;

      // Find category IDs
      const salgadasCat = categories?.find((c: DbCategory) => c.name === 'Salgadas');
      const docesCat = categories?.find((c: DbCategory) => c.name === 'Doces');

      // Map products to Pizza type
      const mapToPizza = (p: DbProduct): Pizza => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        isPremium: p.base_price > 0,
        premiumPrice: p.base_price > 0 ? p.base_price : undefined,
      });

      const salgadas = (products || [])
        .filter((p: DbProduct) => p.category_id === salgadasCat?.id)
        .map(mapToPizza);

      const doces = (products || [])
        .filter((p: DbProduct) => p.category_id === docesCat?.id)
        .map(mapToPizza);

      setPizzasSalgadas(salgadas);
      setPizzasDoces(doces);
      setError(null);
    } catch (err) {
      console.error('Error fetching pizzas:', err);
      setError('Erro ao carregar pizzas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPizzas();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchPizzas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    pizzasSalgadas,
    pizzasDoces,
    allPizzas: [...pizzasSalgadas, ...pizzasDoces],
    loading,
    error,
    refetch: fetchPizzas,
  };
};
