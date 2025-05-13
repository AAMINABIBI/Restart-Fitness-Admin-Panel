import React, { useState } from 'react';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './chatscreen.css';
import user from '../assets/user.jpg'
function ChatScreen() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Static data for conversations
  const conversations = [
    {
      id: 1,
      user: 'Roselle Ehrman',
      lastMessage: 'You: OK lets get it',
      time: '09:30 AM',
      messages: [
        { sender: 'Roselle Ehrman', text: 'Hi! How are you?', time: '08:45 AM', date: 'Yesterday' },
        { sender: 'You', text: "Hey Roselle! I'm feeling amazing, how about you?", time: '08:45 AM' },
        { sender: 'Roselle Ehrman', text: 'Hey, so happy you are down!', time: '08:45 AM' },
        { sender: 'You', text: "That's a cool idea", time: '08:45 AM' },
      ],
    },
    { id: 2, user: 'Leatrice Kulik', lastMessage: 'back to meeting', time: '09:30 AM', messages: [] },
    { id: 3, user: 'James B', lastMessage: 'Voice message 00:30', time: '09:15 AM', messages: [] },
    { id: 4, user: 'Jone Smith', lastMessage: 'Voice message 00:30', time: '1 DAY ago', messages: [] },
    { id: 5, user: 'Darron', lastMessage: 'sent an attachment', time: '2 DAY ago', messages: [] },
    { id: 6, user: 'Nitolia', lastMessage: 'will do...', time: '4 DAY ago', messages: [] },
    { id: 7, user: 'Emillio', lastMessage: 'Thanks...', time: '4 DAY ago', messages: [] },
    { id: 8, user: 'Adriana', lastMessage: 'Will back soon...', time: '7 DAY ago', messages: [] },
    { id: 9, user: 'Leon', lastMessage: 'Thanks...', time: '9 DAY ago', messages: [] },
    { id: 10, user: 'Bruno', lastMessage: 'sure I will check', time: '10 DAY ago', messages: [] },
  ];

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    console.log('New message:', { chatId: selectedChat.id, text: newMessage });
    // Add the new message to the selected chat (for now, just log it)
    const updatedChat = {
      ...selectedChat,
      messages: [
        ...selectedChat.messages,
        { sender: 'You', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ],
    };
    setSelectedChat(updatedChat);

    // Update the conversations list with the new last message
    const updatedConversations = conversations.map((conv) =>
      conv.id === selectedChat.id
        ? { ...conv, lastMessage: `You: ${newMessage}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : conv
    );
    // Replace the old conversations array (for demo purposes; in a real app, you'd update the state)
    conversations.splice(0, conversations.length, ...updatedConversations);

    setNewMessage(''); // Clear the input field
  };

  return (
    <div className="chat-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="chat-section">
          <div className="chat-list">
            <div className="chat-list-header">
              <h2>Chat</h2>
              <button className="new-message-button">New Message</button>
            </div>
            <div className="chat-items">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="chat-user">
                    <div className="user-avatar">
                      <img src={user} className='avatar-image'/>
                    </div>
                    <div className="user-info">
                      <div className="user-name">{chat.user}</div>
                      <div className="last-message">{chat.lastMessage}</div>
                    </div>
                  </div>
                  <div className="chat-time">{chat.time}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="chat-window">
            {selectedChat ? (
              <>
                <div className="chat-header">
                  <div className="chat-user">
                    <div className="user-avatar"></div>
                    <div className="user-name">{selectedChat.user}</div>
                  </div>
                </div>
                <div className="chat-messages">
                  {selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((message, index) => (
                      <div key={index} className="message-group">
                        {(index === 0 || message.date) && (
                          <div className="message-date">{message.date || 'Today'}</div>
                        )}
                        <div
                          className={`message ${
                            message.sender === 'You' ? 'message-sent' : 'message-received'
                          }`}
                        >
                          <div className="message-text">{message.text}</div>
                          <div className="message-time">
                            {message.sender === 'You' ? 'YOU' : selectedChat.user} {message.time}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-messages">No messages yet. Start the conversation!</div>
                  )}
                </div>
                <form className="message-input" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={handleMessageChange}
                  />
                  <button type="submit" className="send-button">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 12L22 2L12 22L2 12Z"
                        stroke="#d2b48c"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="no-chat-selected">Select a chat to start messaging</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;