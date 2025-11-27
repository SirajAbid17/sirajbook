import React, { useState } from 'react';


export default function Aiimg() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Hey there! I can help you today", sender: "bot" },
    { id: 2, text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis in accusantium temporibus, asperiores sit ipsa inventore, laudantium velit officiis eaque possimus, ea at cum tenetur non? Maxime, magnam! Molestias, vitae.", sender: "bot" }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
  
    const newUserMessage = { id: Date.now(), text: message, sender: "user" };
    setChatHistory([...chatHistory, newUserMessage]);
    
 
    setMessage('');
    
  
    setTimeout(() => {
      const botResponse = { 
        id: Date.now() + 1, 
        text: "I understand your message. How else can I assist you?", 
        sender: "bot" 
      };
      setChatHistory(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className="ai-chatbot-container">
      <div className="chat-header">
        <div className="chatbot-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="white"/>
            <path d="M8 10C8 11.1 8.9 12 10 12C11.1 12 12 11.1 12 10C12 8.9 11.1 8 10 8C8.9 8 8 8.9 8 10ZM14 10C14 11.1 14.9 12 16 12C17.1 12 18 11.1 18 10C18 8.9 17.1 8 16 8C14.9 8 14 8.9 14 10ZM15.23 15C14.42 15.95 13.28 16.5 12 16.5C10.72 16.5 9.58 15.95 8.77 15C8.36 15 8 15.36 8 15.77C8 16.18 8.36 16.55 8.77 16.55C9.81 17.5 11.07 18 12.01 18C12.95 18 14.21 17.5 15.25 16.55C15.66 16.55 16.02 16.19 16.02 15.78C16.02 15.37 15.66 15 15.25 15H15.23Z" fill="white"/>
          </svg>
        </div>
        <div className="chat-header-info ">
          <h1>AI Assistant</h1>
          <p>Online</p>
        </div>
      </div>
      
      <div className="chat-messages">
        {chatHistory.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage}>
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}