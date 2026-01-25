import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface StoreSettings {
  is_open: boolean;
  open_time: string;
  close_time: string;
  closed_days: number[];
  manual_override: boolean;
}

const OpenStatus = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAutoStatus = (settings: StoreSettings) => {
    const now = new Date();
    const day = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Check if it's a closed day
    if (settings.closed_days?.includes(day)) {
      return false;
    }
    
    // Check time range
    return currentTime >= settings.open_time && currentTime < settings.close_time;
  };

  const determineStatus = (settings: StoreSettings) => {
    if (settings.manual_override) {
      // Use manual setting
      return settings.is_open;
    } else {
      // Use automatic calculation based on time
      return checkAutoStatus(settings);
    }
  };

  const fetchStatus = async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching store status:', error);
      setIsOpen(false);
    } else if (data) {
      setIsOpen(determineStatus(data));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();

    // Subscribe to realtime changes on store_settings table
    const channel = supabase
      .channel('store-status-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_settings',
        },
        (payload) => {
          console.log('Store settings updated (realtime):', payload);
          const newSettings = payload.new as StoreSettings;
          if (newSettings) {
            setIsOpen(determineStatus(newSettings));
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Also check periodically for auto mode time changes
    const interval = setInterval(fetchStatus, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground"
      >
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
        Carregando...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        isOpen 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      {isOpen ? 'Aberto' : 'Fechado'}
    </motion.div>
  );
};

export default OpenStatus;
