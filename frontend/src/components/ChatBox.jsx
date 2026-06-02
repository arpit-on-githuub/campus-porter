import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const socket = io('http://localhost:3000');

const ChatBox = ({ requestId, otherUser, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
  if (isOpen && requestId) {
    socket.emit('join_room', requestId);

    socket.on('receive_message', (data) => {
      setMessages((prev) => {
        const isDuplicate = prev.some(
          (m) => m.senderId === data.senderId && 
                 m.timestamp === data.timestamp
        );
        if (isDuplicate) return prev;
        return [...prev, data];
      });
    });
  }

  return () => {
    socket.off('receive_message');
  };
}, [isOpen, requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
  if (!newMessage.trim()) return;

  const messageData = {
    requestId,
    senderId: user.id,
    senderName: user.name,
    message: newMessage,
    timestamp: new Date().toISOString()
  };

  socket.emit('send_message', messageData);
  setNewMessage('');
};
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Chat panel — slides up from bottom like Rapido */}
      <div className={`absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl flex flex-col ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}
        style={{ height: '75vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
              {otherUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {otherUser?.name}
              </p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">💬</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Start a conversation with {otherUser?.name}
              </p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.senderId === user.id;
            return (
              <div
                key={index}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">
                    {msg.senderName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-br-sm'
                    : isDark
                      ? 'bg-slate-700 text-slate-100 rounded-bl-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}>
                  <p>{msg.message}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`px-4 py-3 border-t flex items-center gap-3 ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={`flex-1 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-slate-700 text-white placeholder-slate-400'
                : 'bg-slate-100 text-slate-800'
            }`}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;