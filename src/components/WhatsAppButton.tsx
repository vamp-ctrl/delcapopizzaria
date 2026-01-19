import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://w.app/sg7lgy"
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center"
    >
      <MessageSquare className="w-6 h-6" />
    </motion.a>
  );
};

export default WhatsAppButton;
