
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

class ChatService {
  private static instance: ChatService;
  private messages: Message[] = [];
  private localStorageKey = 'undercover_chat_messages';

  private constructor() {
    this.loadMessages();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private loadMessages(): void {
    const storedMessages = localStorage.getItem(this.localStorageKey);
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        this.messages = parsedMessages.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }));
      } catch (error) {
        console.error('Error loading messages from localStorage:', error);
        this.messages = [];
      }
    }
  }

  private saveMessages(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.messages));
  }

  public getAllMessages(): Message[] {
    return [...this.messages];
  }

  public addMessage(text: string, sender: string, isCurrentUser: boolean): Message {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender,
      timestamp: new Date(),
      isCurrentUser
    };
    
    this.messages.push(newMessage);
    this.saveMessages();
    return newMessage;
  }

  public clearMessages(): void {
    this.messages = [];
    this.saveMessages();
  }
}

export default ChatService.getInstance();
