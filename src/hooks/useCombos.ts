import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ComboItem {
  id: string;
  product_name: string;
  quantity: number;
}

interface Combo {
  id: string;
  name: string;
  description: string | null;
  regular_price: number;
  combo_price: number;
  image_url: string | null;
  pizza_size: string | null;
  allowed_flavor_ids: string[] | null;
  allowed_drink_ids: string[] | null;
  items: ComboItem[];
}

export const useCombos = () => {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const { data: combosData, error } = await supabase
          .from('combos')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching combos:', error);
          setLoading(false);
          return;
        }

        // Fetch items for each combo
        const combosWithItems = await Promise.all(
          (combosData || []).map(async (combo) => {
            const { data: itemsData } = await supabase
              .from('combo_items')
              .select('id, product_name, quantity')
              .eq('combo_id', combo.id);
            return { 
              ...combo, 
              items: itemsData || [],
              allowed_flavor_ids: combo.allowed_flavor_ids || null,
              allowed_drink_ids: combo.allowed_drink_ids || null,
              pizza_size: combo.pizza_size || null,
            };
          })
        );

        setCombos(combosWithItems);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('combos-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'combos' },
        () => {
          fetchCombos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { combos, loading };
};
