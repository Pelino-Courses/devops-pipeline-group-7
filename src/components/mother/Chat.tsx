import { useState } from 'react';
import { ArrowLeft, Send, Paperclip, Video, Phone } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { User } from '../../App';

interface ChatProps {
  user: User;
}

const mockConversations = [
  {
    id: '1',
    name: 'Dr. Uwase Marie',
    role: 'Obstetrician',
    clinic: 'Kigali Health Center',
    lastMessage: 'Your test results look good!',
    time: '10:30 AM',
    unread: 2,
  },
  {
    id: '2',
    name: 'Nurse Peace',
    role: 'Midwife',
    clinic: 'Kigali Health Center',
    lastMessage: 'Remember to take your vitamins',
    time: 'Yesterday',
    unread: 0,
  },
];

const mockMessages = [
  {
    id: '1',
    sender: 'doctor',
    text: 'Hello! How are you feeling today?',
    time: '10:25 AM',
  },
  {
    id: '2',
    sender: 'user',
    text: 'Hi Doctor, I\'m feeling good. Just a bit tired.',
    time: '10:27 AM',
  },
  {
    id: '3',
    sender: 'doctor',
    text: 'That\'s completely normal at this stage. Make sure you\'re getting enough rest and staying hydrated.',
    time: '10:28 AM',
  },
  {
    id: '4',
    sender: 'doctor',
    text: 'Your test results look good! Everything is progressing well.',
    time: '10:30 AM',
  },
  {
    id: '5',
    sender: 'user',
    text: 'Thank you so much! That\'s a relief.',
    time: '10:32 AM',
  },
];

export function Chat({ user }: ChatProps) {
  const [view, setView] = useState<'list' | 'conversation'>('list');
  const [selectedConversation, setSelectedConversation] = useState<typeof mockConversations[0] | null>(null);
  const [message, setMessage] = useState('');

  const handleSelectConversation = (conversation: typeof mockConversations[0]) => {
    setSelectedConversation(conversation);
    setView('conversation');
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // In real app, send message to backend
    setMessage('');
  };

  if (view === 'conversation' && selectedConversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Chat Header */}
        <div className="bg-pink-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setView('list')}>
                <ArrowLeft className="w-6 h-6" />
              </button>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-pink-300">
                  {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-sm">{selectedConversation.name}</h2>
                <p className="text-xs opacity-90">{selectedConversation.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-white/20 rounded-full">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/20 rounded-full">
                <Video className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.sender === 'user'
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-pink-100' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500">
              <Paperclip className="w-5 h-5" />
            </button>
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="bg-pink-500 hover:bg-pink-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pink-500 text-white p-4">
        <h1>Messages</h1>
      </div>

      {/* Conversations List */}
      <div className="p-4 space-y-2">
        {mockConversations.map(conversation => (
          <Card
            key={conversation.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleSelectConversation(conversation)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-pink-100 text-pink-600">
                    {conversation.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3 className="text-sm">{conversation.name}</h3>
                      <p className="text-xs text-gray-600">{conversation.role} - {conversation.clinic}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {conversation.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    {conversation.unread > 0 && (
                      <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
