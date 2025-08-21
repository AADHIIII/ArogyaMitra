'use client';

import { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Mock data - replace with actual API calls
const mockConversations = [
  {
    id: '1',
    participantName: 'Dr. Sarah Wilson',
    participantRole: 'Cardiologist',
    lastMessage: 'Your test results look good. Continue with the current medication.',
    lastMessageTime: '2 hours ago',
    unreadCount: 0,
    isOnline: true
  },
  {
    id: '2',
    participantName: 'Dr. Rajesh Kumar',
    participantRole: 'General Medicine',
    lastMessage: 'Please take the medication with food as discussed.',
    lastMessageTime: '1 day ago',
    unreadCount: 2,
    isOnline: false
  },
  {
    id: '3',
    participantName: 'Dr. Priya Sharma',
    participantRole: 'Dermatologist',
    lastMessage: 'The cream should be applied twice daily.',
    lastMessageTime: '3 days ago',
    unreadCount: 0,
    isOnline: true
  }
];

const mockMessages = [
  {
    id: '1',
    senderId: 'patient-1',
    senderName: 'You',
    content: 'Hello Dr. Wilson, I have a question about my medication.',
    timestamp: '2025-08-11T10:30:00Z',
    isFromCurrentUser: true
  },
  {
    id: '2',
    senderId: 'doctor-1',
    senderName: 'Dr. Sarah Wilson',
    content: 'Hello! I\'m here to help. What\'s your question?',
    timestamp: '2025-08-11T10:32:00Z',
    isFromCurrentUser: false
  },
  {
    id: '3',
    senderId: 'patient-1',
    senderName: 'You',
    content: 'Should I take the aspirin with food or on an empty stomach?',
    timestamp: '2025-08-11T10:35:00Z',
    isFromCurrentUser: true
  },
  {
    id: '4',
    senderId: 'doctor-1',
    senderName: 'Dr. Sarah Wilson',
    content: 'It\'s better to take aspirin with food to avoid stomach upset. Take it with breakfast or after a meal.',
    timestamp: '2025-08-11T10:36:00Z',
    isFromCurrentUser: false
  },
  {
    id: '5',
    senderId: 'patient-1',
    senderName: 'You',
    content: 'Thank you for the clarification, Doctor!',
    timestamp: '2025-08-11T10:38:00Z',
    isFromCurrentUser: true
  },
  {
    id: '6',
    senderId: 'doctor-1',
    senderName: 'Dr. Sarah Wilson',
    content: 'You\'re welcome! Feel free to reach out if you have any other questions. Your test results look good, by the way. Continue with the current medication.',
    timestamp: '2025-08-11T12:15:00Z',
    isFromCurrentUser: false
  }
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message sending logic here
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatLastMessageTime = (timeString: string) => {
    return timeString;
  };

  const filteredConversations = mockConversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout showSearch={false}>
      <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation.id === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    {conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-success-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.participantName}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{conversation.participantRole}</p>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatLastMessageTime(conversation.lastMessageTime)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    {selectedConversation.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-success-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedConversation.participantName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.participantRole}
                      {selectedConversation.isOnline && (
                        <span className="ml-2 text-success-600">• Online</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.isFromCurrentUser
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isFromCurrentUser ? 'text-primary-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="icon"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}