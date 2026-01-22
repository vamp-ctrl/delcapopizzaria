import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, Store, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  order_id: string | null;
}

interface Conversation {
  sender_id: string;
  customer_name: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

const ChatTab = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          if (newMsg.sender_type === 'customer') {
            toast.info('💬 Nova mensagem recebida!');
            fetchMessages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
      return;
    }

    // Group messages by sender_id (customer)
    const grouped = (data || []).reduce((acc, msg) => {
      const key = msg.sender_type === 'customer' ? msg.sender_id : 
        // For admin messages, find the customer they're replying to
        (data.find(m => m.order_id === msg.order_id && m.sender_type === 'customer')?.sender_id || msg.sender_id);
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(msg);
      return acc;
    }, {} as Record<string, ChatMessage[]>);

    // Create conversation objects
    const convs: Conversation[] = Object.entries(grouped).map(([senderId, messages]) => {
      const customerMessages = messages.filter(m => m.sender_type === 'customer');
      const lastMsg = messages[messages.length - 1];
      
      return {
        sender_id: senderId,
        customer_name: `Cliente ${senderId.slice(0, 8)}`,
        lastMessage: lastMsg.message,
        lastTime: lastMsg.created_at,
        unreadCount: customerMessages.filter(m => !m.is_read).length,
        messages,
      };
    });

    // Sort by last message time
    convs.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

    setConversations(convs);
    setLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const selectedConv = conversations.find(c => c.sender_id === selectedConversation);
    
    const { error } = await supabase.from('chat_messages').insert({
      sender_id: user.id,
      sender_type: 'admin',
      message: newMessage.trim(),
      order_id: selectedConv?.messages[0]?.order_id || null,
    });

    if (error) {
      toast.error('Erro ao enviar mensagem');
      return;
    }

    setNewMessage('');
    fetchMessages();
  };

  const markAsRead = async (conversationId: string) => {
    const conv = conversations.find(c => c.sender_id === conversationId);
    if (!conv) return;

    const unreadIds = conv.messages
      .filter(m => m.sender_type === 'customer' && !m.is_read)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .in('id', unreadIds);
      
      fetchMessages();
    }
  };

  const handleSelectConversation = (senderId: string) => {
    setSelectedConversation(senderId);
    markAsRead(senderId);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation, conversations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedConv = conversations.find(c => c.sender_id === selectedConversation);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Chat com Clientes
          {totalUnread > 0 && (
            <Badge variant="destructive">{totalUnread} não lidas</Badge>
          )}
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-4 h-[500px]">
        {/* Conversations List */}
        <div className="md:col-span-1 border border-border rounded-xl overflow-hidden">
          <div className="bg-muted/50 p-3 border-b border-border">
            <h3 className="font-medium text-sm">Conversas</h3>
          </div>
          <ScrollArea className="h-[calc(500px-48px)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Nenhuma conversa ainda
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map(conv => (
                  <motion.button
                    key={conv.sender_id}
                    whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                    onClick={() => handleSelectConversation(conv.sender_id)}
                    className={`w-full p-3 text-left transition-colors ${
                      selectedConversation === conv.sender_id
                        ? 'bg-primary/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {conv.customer_name}
                      </span>
                      {conv.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(conv.lastTime)}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-2 border border-border rounded-xl overflow-hidden flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="bg-primary p-3 text-primary-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{selectedConv.customer_name}</span>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {selectedConv.messages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.sender_type === 'admin'
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(msg.created_at)}
                            </span>
                            {msg.sender_type === 'admin' && msg.is_read && (
                              <CheckCheck className="w-3 h-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecione uma conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTab;
