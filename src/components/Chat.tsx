
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import chatService, { Message } from '@/services/chatService';
import { generateRandomGradient } from '@/lib/animation-utils';

const ChatMessageItem: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`mb-4 flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isCurrentUser && (
        <div className="mr-2 flex-shrink-0">
          <Avatar className="w-8 h-8 border border-primary/20">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`} />
            <AvatarFallback className={`${generateRandomGradient()} text-white font-bold`}>
              {message.sender.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      <div className={`max-w-[70%] ${message.isCurrentUser ? 'gradient-primary text-white' : 'glass text-white'} rounded-2xl px-4 py-2`}>
        {!message.isCurrentUser && (
          <div className="font-semibold text-xs mb-1 text-accent">{message.sender}</div>
        )}
        <p className="text-sm">{message.text}</p>
        <div className={`text-xs mt-1 ${message.isCurrentUser ? 'text-white/70' : 'text-white/70'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {message.isCurrentUser && (
        <div className="ml-2 flex-shrink-0">
          <Avatar className="w-8 h-8 border border-primary/20">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=You`} />
            <AvatarFallback className="gradient-accent text-primary font-bold">
              Y
            </AvatarFallback>
          </Avatar>
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
      chatService.addMessage('I\'m good, thanks! Just checking out this new app.', 'You', true);
      chatService.addMessage('It looks pretty cool right? The gradients are nice.', 'Sarah', false);
      chatService.addMessage('Yeah, loving the design! Very Gen-Z friendly.', 'You', true);
      chatService.addMessage('Have you tried the new features?', 'Alex', false);
      setMessages(chatService.getAllMessages());
    }
  }, []);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const message = chatService.addMessage(newMessage, 'You', true);
    setMessages(chatService.getAllMessages());
    setNewMessage('');
    
    // Simulate a response after a short delay
    setTimeout(() => {
      const names = ['John', 'Sarah', 'Alex', 'Emma', 'Mike'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const responses = [
        "That's cool! 😎",
        "I like your perspective on that!",
        "Thanks for sharing! How's your day going?",
        "Interesting! Tell me more about it.",
        "I agree with you on that!",
        "That's a great point! 👍",
        "Have you seen the latest updates?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      chatService.addMessage(randomResponse, randomName, false);
      setMessages(chatService.getAllMessages());
    }, 1000);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-180px)] rounded-xl glass p-2 mb-16">
      <div className="p-3 border-b border-white/10 flex items-center">
        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center mr-3">
          <User className="text-white w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Undercover Chat</h3>
          <p className="text-xs text-white/70">Connect with others</p>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </ScrollArea>
      
      <div className="p-3 border-t border-white/10 flex items-center">
        <Input
          className="flex-1 mr-2 bg-secondary/30 text-white placeholder:text-white/50 border-white/10"
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
