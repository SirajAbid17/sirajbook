import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import io from 'socket.io-client';
import { ServerUrl } from '../App';
import Lefthome from './Lefthome';

export default function Message() {
  const { userdata } = useSelector((state) => state.user || {});

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [previousChats, setPreviousChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pendingMessagesRef = useRef(new Set()); 
  const selectedUserRef = useRef(null);

  
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

 
  useEffect(() => {
    if (!userdata?._id) return;

    socketRef.current = io(ServerUrl, { 
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('user_online', userdata._id);
    });

    socketRef.current.on('receive_message', (message) => {
      const currentSelectedUser = selectedUserRef.current;
      
  
      if (message.sender?._id === userdata?._id) {
       
        setMessages(prev => prev.map(msg => {
       
          if (msg.isOptimistic && 
              msg.message === message.message && 
              Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000) {
            return message;
          }
          return msg;
        }));
        
      
        updatePreviousChatsWithMessage(message);
        return;
      }
      
 
      if (currentSelectedUser && 
          (message.sender?._id === currentSelectedUser._id || 
           message.receiver?._id === currentSelectedUser._id)) {
        
       
        setMessages(prev => {
          const exists = prev.some(m => m._id === message._id || 
            (m.tempId && m.tempId === message.tempId));
          if (exists) return prev;
          return [...prev, message];
        });
        
      
        updatePreviousChatsWithMessage(message);
      }
    });

    socketRef.current.on('user_typing', (data) => {
      if (data.userId !== userdata._id && data.conversationId === selectedUser?.conversationId) {
        setIsTyping(data.isTyping);
        setTypingUser(data.userId);
      }
    });

    socketRef.current.on('user_status_changed', (data) => {
      setOnlineUsers(prev => {
        const setCopy = new Set(prev);
        if (data.isOnline) setCopy.add(data.userId);
        else setCopy.delete(data.userId);
        return setCopy;
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userdata?._id]);


  const updatePreviousChatsWithMessage = useCallback((message) => {
    setPreviousChats(prev => {
      const updatedChats = [...prev];
      const otherUserId = message.sender?._id === userdata?._id 
        ? message.receiver?._id 
        : message.sender?._id;
      
      const userIndex = updatedChats.findIndex(chat => chat._id === otherUserId);
      
      if (userIndex !== -1) {
        const updatedUser = { 
          ...updatedChats[userIndex], 
          lastMessage: message,
          updatedAt: new Date().toISOString()
        };
        updatedChats.splice(userIndex, 1);
        updatedChats.unshift(updatedUser);
      } else {
      
      }
      
      return updatedChats;
    });
  }, [userdata]);

 
  useEffect(() => {
    if (selectedUser?.conversationId && socketRef.current?.connected) {
      socketRef.current.emit('join_conversation', selectedUser.conversationId);
      setIsTyping(false);
      setTypingUser(null);
    }
  }, [selectedUser]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [chatsResponse, usersResponse] = await Promise.all([
          axios.get(`${ServerUrl}/api/previouschat`, { withCredentials: true }),
          axios.get(`${ServerUrl}/api/allusers`, { withCredentials: true }),
        ]);

        const chatsData = Array.isArray(chatsResponse.data) ? chatsResponse.data : [];
        const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        
        setPreviousChats(chatsData);
        setAllUsers(usersData);
      } catch (err) {
        console.error('fetchData error:', err);
        setPreviousChats([]);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const fetchMessages = useCallback(async (userId) => {
    try {
      const res = await axios.get(`${ServerUrl}/api/getallmsg/${userId}`, { 
        withCredentials: true 
      });
      
      const fetchedMessages = Array.isArray(res.data) ? res.data : [];
      setMessages(fetchedMessages);
      
    
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (err) {
      console.error('fetchMessages error:', err);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser, fetchMessages]);

 
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages, isTyping, scrollToBottom]);

  // Typing indicator
  const emitTyping = useCallback((isTypingFlag) => {
    if (!socketRef.current?.connected || !selectedUser?.conversationId || !userdata?._id) return;
    
    socketRef.current.emit(isTypingFlag ? 'typing_start' : 'typing_stop', {
      conversationId: selectedUser.conversationId,
      userId: userdata._id,
    });
  }, [selectedUser, userdata]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (value.trim()) {
      emitTyping(true);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1000);
    } else {
      emitTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if ((!newMessage || newMessage.trim() === '') && !image) {
      return alert('Please enter a message or select an image');
    }

    if (!selectedUser?._id) return alert('Please select a user to chat with');

    try {
      setSending(true);

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
  
      const optimisticMessage = {
        _id: tempId,
        tempId: tempId,
        message: newMessage.trim(),
        image: image ? 'uploading...' : null,
        sender: userdata,
        receiver: selectedUser,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        pending: true
      };
      
    
      pendingMessagesRef.current.add(tempId);
      
     
      setMessages(prev => [...prev, optimisticMessage]);
      
     
      setNewMessage('');
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
  
      emitTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

  
      const formData = new FormData();
      if (optimisticMessage.message) formData.append('message', optimisticMessage.message);
      if (image) formData.append('image', image);

      const res = await axios.post(
        `${ServerUrl}/api/sendmsg/${selectedUser._id}`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const sentMessage = res.data;
      
     
      pendingMessagesRef.current.delete(tempId);
    
      updatePreviousChatsWithMessage(sentMessage);

   
      setTimeout(() => {
        scrollToBottom();
      }, 150);

   
      setShowNewChat(false);
    } catch (err) {
      console.error('send msg error:', err);
      
    
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      pendingMessagesRef.current.delete(tempId);
      setMessages(prev => prev.filter(msg => !(msg.isOptimistic && msg.pending)));
      
      const errorMessage = err?.response?.data?.error || 'Failed to send message';
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      return alert('Please select an image file');
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return alert('Image size should be less than 5MB');
    }
    
    setImage(file);
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => fileInputRef.current?.click();

 
  const getDisplayName = (user) => 
    user?.username || user?.name || 'Unknown User';

  const getProfilePic = (user) => 
    user?.profileimg || user?.profilepic || '';

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path === 'uploading...') return '';
    if (path.startsWith('http')) return path;
    return `${ServerUrl}${path}`;
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserInitials = (user) => {
    const name = getDisplayName(user);
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || '??';
  };

  const getAvatarColor = (userId) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    if (!userId) return colors[0];
    return colors[userId.charCodeAt(0) % colors.length];
  };

  const filteredUsers = allUsers.filter(user => 
    user._id !== userdata?._id && 
    (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     user.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isUserOnline = (userId) => onlineUsers.has(userId);

  return (
    <div className="flex w-full h-screen bg-black text-white overflow-hidden">
     
      <div className='lg:w-[20%] hidden lg:block h-full'>
        <Lefthome />
      </div>

      <div className="flex-1 flex h-full overflow-hidden">
     
        <aside className="w-full md:w-80 border-r border-gray-800 bg-black overflow-y-auto flex flex-col h-full">
          <div className="p-4 border-b border-gray-800">
            <button
              className="w-full py-2 bg-transparent text-white border border-white rounded-lg font-medium hover:bg-white hover:text-black transition"
              onClick={() => setShowNewChat(true)}
            >
              + New Chat
            </button>
          </div>

          {loading && previousChats.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6 text-gray-400">
              Loading chats...
            </div>
          ) : previousChats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400">
              <p>No conversations yet</p>
              <button
                onClick={() => setShowNewChat(true)}
                className="mt-3 px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition"
              >
                Start Chatting
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {previousChats.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 cursor-pointer flex items-center gap-3 hover:bg-gray-900 ${
                    selectedUser?._id === user._id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="relative">
                    {getProfilePic(user) ? (
                      <img 
                        src={getProfilePic(user)} 
                        alt={getDisplayName(user)} 
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-800" 
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor(user._id)} font-semibold`}>
                        {getUserInitials(user)}
                      </div>
                    )}
                    {isUserOnline(user._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold truncate">
                        {getDisplayName(user)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user.lastMessage ? formatTime(user.lastMessage.createdAt) : ''}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {user.lastMessage ? 
                        (user.lastMessage.image ? '📷 Image' : user.lastMessage.message) : 
                        'No messages yet'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

     
        <main className="flex-1 flex flex-col bg-black h-full overflow-hidden">
          {selectedUser ? (
            <>
         
              <header className="p-4 border-b border-gray-800 flex items-center gap-3 flex-shrink-0">
                <div className="relative">
                  {getProfilePic(selectedUser) ? (
                    <img 
                      src={getProfilePic(selectedUser)} 
                      alt={getDisplayName(selectedUser)} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-800" 
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor(selectedUser._id)} font-semibold`}>
                      {getUserInitials(selectedUser)}
                    </div>
                  )}
                  {isUserOnline(selectedUser._id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">{getDisplayName(selectedUser)}</div>
                  <div className={`text-xs ${isUserOnline(selectedUser._id) ? 'text-green-500' : 'text-gray-400'}`}>
                    {isUserOnline(selectedUser._id) ? '● Online' : '○ Offline'}
                  </div>
                </div>
              </header>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                      <div className="text-6xl mb-3 opacity-60">💬</div>
                      <div>No messages yet</div>
                      <div className="text-sm mt-2">
                        Send a message to start the conversation
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div 
                          key={message._id || message.tempId} 
                          className={`mb-4 flex ${
                            message.sender?._id === userdata?._id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                            message.sender?._id === userdata?._id 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-800 text-white border border-gray-700'
                          } ${message.isOptimistic ? 'opacity-80' : ''}`}>
                            {message.image && message.image !== 'uploading...' && (
                              <img
                                src={getImageUrl(message.image)}
                                alt="attachment"
                                className="w-full max-h-72 object-cover rounded-lg mb-2 cursor-pointer"
                                onClick={() => window.open(getImageUrl(message.image), '_blank')}
                              />
                            )}
                            {message.image === 'uploading...' && (
                              <div className="w-full max-h-72 flex items-center justify-center rounded-lg mb-2 bg-gray-700 p-4">
                                <div className="animate-pulse text-gray-400">Uploading image...</div>
                              </div>
                            )}
                            {message.message && (
                              <div className="whitespace-pre-wrap">
                                {message.message}
                                {message.isOptimistic && (
                                  <span className="ml-2 text-xs opacity-70">⏳</span>
                                )}
                              </div>
                            )}
                            <div className="text-xs opacity-70 text-right mt-2">
                              {formatTime(message.createdAt)}
                              {message.isOptimistic && ' (Sending...)'}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="mb-4 flex justify-start">
                          <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-gray-800 text-white border border-gray-700">
                            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                              <div className="flex gap-1">
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" />
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" />
                                <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse" />
                              </div>
                              <span>typing...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex-shrink-0">
                {image && (
                  <div className="mb-3 flex items-center justify-between gap-3 bg-gray-900 p-3 rounded">
                    <div className="flex items-center gap-3">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt="preview" 
                        className="w-12 h-12 object-cover rounded" 
                      />
                      <div className="text-sm truncate max-w-xs">{image.name}</div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={removeImage} 
                        className="px-3 py-1 rounded border border-gray-700 text-sm hover:bg-gray-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 items-stretch">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 rounded-full border border-gray-800 text-sm bg-black text-white outline-none focus:border-white"
                    disabled={sending}
                  />

                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />

                  <button 
                    type="button" 
                    onClick={triggerFileInput} 
                    className="px-4 py-2 rounded-full border border-gray-700 text-sm hover:bg-gray-900"
                    disabled={sending}
                  >
                    📎
                  </button>

                  <button
                    type="submit"
                    disabled={((!newMessage || newMessage.trim() === '') && !image) || sending}
                    className="px-5 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
              <div className="text-6xl mb-4 opacity-60">💬</div>
              <h3 className="text-xl">Welcome to Messages</h3>
              <p className="mt-2 text-center">
                Select a conversation from the sidebar to start chatting
              </p>
              <button 
                onClick={() => setShowNewChat(true)} 
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Start New Conversation
              </button>
            </div>
          )}
        </main>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
            <div className="bg-black w-full max-w-lg rounded-lg border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold">New Conversation</h3>
                <button 
                  onClick={() => { 
                    setShowNewChat(false); 
                    setSearchTerm(''); 
                  }} 
                  className="text-2xl hover:text-gray-400"
                >
                  ×
                </button>
              </div>

              <div className="p-4 border-b border-gray-800">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="w-full px-3 py-2 rounded border border-gray-800 bg-black text-white outline-none focus:border-white"
                />
              </div>

              <div className="max-h-80 overflow-y-auto p-2">
                {filteredUsers.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    {searchTerm ? 'No users found' : 'No users available'}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div 
                      key={user._id} 
                      onClick={() => { 
                        setSelectedUser(user); 
                        setShowNewChat(false); 
                        setSearchTerm(''); 
                      }} 
                      className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-900 rounded"
                    >
                      {getProfilePic(user) ? (
                        <img 
                          src={getProfilePic(user)} 
                          alt={getDisplayName(user)} 
                          className="w-10 h-10 rounded-full object-cover" 
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(user._id)} font-semibold`}>
                          {getUserInitials(user)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{getDisplayName(user)}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
