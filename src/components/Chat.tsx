import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  time: string;
}

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Olá! Bem-vindo à Del Capo Pizzaria! Como posso ajudar?',
      isUser: false,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: message,
      isUser: true,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulated response
    setTimeout(() => {
      const response: Message = {
        id: Date.now() + 1,
        text: 'Obrigado pela mensagem! Para um atendimento mais rápido, entre em contato pelo nosso WhatsApp clicando no botão verde no canto da tela.',
        isUser: false,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-40 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            <div className="bg-primary p-4">
              <h3 className="text-primary-foreground font-semibold">Chat - Del Capo</h3>
              <p className="text-primary-foreground/80 text-sm">Online agora</p>
            </div>

            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.isUser
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-card text-foreground border border-border rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <span className={`text-xs mt-1 block ${msg.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-3 border-t border-border bg-card">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="bg-primary hover:bg-tomato-light">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chat;
