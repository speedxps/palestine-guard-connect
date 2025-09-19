import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BackButton } from '@/components/BackButton';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  Paperclip, 
  MapPin,
  Phone,
  Video,
  Shield
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'image' | 'location';
  isOwn: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'group' | 'private';
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
}

const demoChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: 'غرفة العمليات الرئيسية',
    type: 'group',
    lastMessage: 'تم تأكيد وصول الدعم إلى الموقع',
    timestamp: '14:30',
    unread: 3,
    isOnline: true
  },
  {
    id: '2',
    name: 'قائد الدورية الشرقية',
    type: 'private',
    lastMessage: 'سأكون في الموقع خلال 10 دقائق',
    timestamp: '14:15',
    unread: 1,
    isOnline: true
  },
  {
    id: '3',
    name: 'فريق التحقيقات',
    type: 'group',
    lastMessage: 'نحتاج إلى مراجعة تسجيلات الكاميرات',
    timestamp: '13:45',
    unread: 0,
    isOnline: false
  },
  {
    id: '4',
    name: 'الدعم التقني',
    type: 'group',
    lastMessage: 'تم إصلاح مشكلة النظام',
    timestamp: '12:30',
    unread: 0,
    isOnline: true
  }
];

const demoMessages: Message[] = [
  {
    id: '1',
    sender: 'أحمد محمد',
    content: 'السلام عليكم، هل تم تأكيد الموقع؟',
    timestamp: '14:25',
    type: 'text',
    isOwn: false
  },
  {
    id: '2',
    sender: 'أنت',
    content: 'نعم، أكدت وصولي إلى الموقع',
    timestamp: '14:26',
    type: 'text',
    isOwn: true
  },
  {
    id: '3',
    sender: 'سارة أحمد',
    content: 'هل تحتاجون دعماً إضافياً؟',
    timestamp: '14:28',
    type: 'text',
    isOwn: false
  },
  {
    id: '4',
    sender: 'أنت',
    content: 'تم تأكيد وصول الدعم إلى الموقع',
    timestamp: '14:30',
    type: 'text',
    isOwn: true
  }
];

const Chat = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(demoMessages);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: String(messages.length + 1),
        sender: 'أنت',
        content: message,
        timestamp: new Date().toLocaleTimeString('ar-SA', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'text',
        isOwn: true
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (selectedChat) {
    return (
      <div className="mobile-container">
        {/* Chat Header */}
        <div className="bg-card/80 backdrop-blur-md border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h3 className="font-semibold font-arabic">غرفة العمليات الرئيسية</h3>
                <p className="text-xs text-green-400">متصل • 12 عضو</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 pb-20 max-h-[calc(100vh-140px)] overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card/50 text-foreground rounded-bl-md'
                }`}
              >
                {!msg.isOwn && (
                  <p className="text-xs text-muted-foreground mb-1 font-arabic">
                    {msg.sender}
                  </p>
                )}
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-card/80 backdrop-blur-md border-t border-border/50 p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالة..."
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="police" 
              size="icon"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-arabic">الرسائل الآمنة</h1>
            <p className="text-sm text-muted-foreground">Secure Messaging</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-4">
        {/* Security Notice */}
        <Card className="glass-card p-4 border-green-500/30 bg-green-500/5">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-400" />
            <div>
              <h4 className="font-semibold text-green-400">تشفير من النهاية للنهاية</h4>
              <p className="text-xs text-green-400/80">
                جميع الرسائل محمية بتشفير متقدم
              </p>
            </div>
          </div>
        </Card>

        {/* Chat Rooms */}
        <div className="space-y-3">
          {demoChatRooms.map((chat) => (
            <Card 
              key={chat.id} 
              className="glass-card p-4 cursor-pointer hover:bg-card/90 transition-all duration-300"
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      chat.type === 'group' ? 'bg-primary/20' : 'bg-blue-500/20'
                    }`}>
                      <span className="text-lg">
                        {chat.type === 'group' ? '👥' : '👤'}
                      </span>
                    </div>
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold font-arabic text-sm">
                        {chat.name}
                      </h3>
                      {chat.type === 'group' && (
                        <Badge variant="outline" className="text-xs">
                          مجموعة
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {chat.lastMessage}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-muted-foreground">
                    {chat.timestamp}
                  </span>
                  {chat.unread > 0 && (
                    <Badge className="bg-emergency text-emergency-foreground text-xs min-w-[20px] h-5 rounded-full">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;