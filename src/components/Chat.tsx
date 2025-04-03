
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User } from 'lucide-react';
import chatService, { Message } from '@/services/chatService';
import { generateRandomGradient } from '@/lib/animation-utils';

const ChatMessageItem: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`mb-4 flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isCurrentUser && (
        <div className="mr-2 flex-shrink-0">
          <div className={`w-8 h-8 rounded-full overflow-hidden ${generateRandomGradient()} flex items-center justify-center text-accent-foreground font-bold`}>
            {message.sender.charAt(0)}
          </div>
        </div>
      )}
      
      <div className={`max-w-[70%] ${message.isCurrentUser ? 'gradient-primary text-primary-foreground' : 'glass text-foreground'} rounded-2xl px-4 py-2`}>
        {!message.isCurrentUser && (
          <div className="font-semibold text-xs mb-1">{message.sender}</div>
        )}
        <p className="text-sm">{message.text}</p>
        <div className={`text-xs mt-1 ${message.isCurrentUser ? 'text-primary-foreground/70' : 'text-foreground/70'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {message.isCurrentUser && (
        <div className="ml-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden gradient-accent flex items-center justify-center text-accent-foreground font-bold">
            Y
          </div>
        </div>
      )}
    </div>
  );
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load initial messages
    setMessages(chatService.getAllMessages());
    
    // If no messages exist, add some initial ones
    if (chatService.getAllMessages().length === 0) {
      chatService.addMessage('Hey, how are you doing?', 'John', false);
      chatService.addMessage('I\'m good, thanks! Just checking out this new app.', 'CurrentUser', true);
      chatService.addMessage('It looks pretty cool right? The gradients are nice.', 'John', false);
      chatService.addMessage('Yeah, loving the design! Very Gen-Z friendly.', 'CurrentUser', true);
      setMessages(chatService.getAllMessages());
    }
  }, []);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const message = chatService.addMessage(newMessage, 'CurrentUser', true);
    setMessages(chatService.getAllMessages());
    setNewMessage('');
    
    // Simulate a response after a short delay
    setTimeout(() => {
      chatService.addMessage('Thanks for your message! This is a simulated response.', 'ChatBot', false);
      setMessages(chatService.getAllMessages());
    }, 1000);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] rounded-xl glass p-2 mb-16">
      <div className="p-3 border-b border-border flex items-center">
        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center mr-3">
          <User className="text-foreground w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold">Undercover Chat</h3>
          <p className="text-xs text-muted-foreground">Connect with others</p>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </ScrollArea>
      
      <div className="p-3 border-t border-border flex items-center">
        <Input
          className="flex-1 mr-2 bg-secondary"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-primary text-white rounded-full p-2 hover:bg-primary/80"
          onClick={handleSendMessage}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Chat;
