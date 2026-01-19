import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const OpenStatus = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkIfOpen = () => {
      const now = new Date();
      const day = now.getDay();
      const hours = now.getHours();
      
      // Closed on Mondays (day = 1)
      if (day === 1) {
        setIsOpen(false);
        return;
      }
      
      // Open from 18:00 to 23:00
      if (hours >= 18 && hours < 23) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkIfOpen();
    const interval = setInterval(checkIfOpen, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

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
