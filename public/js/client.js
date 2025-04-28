const socket = io();

// Generate a random user ID for this session
let currentUser = 'user-' + Math.floor(Math.random() * 1000);
console.log('Your user ID:', currentUser);

// Connection checker
socket.on('connect', () => {
    console.log('Connected to server.');
    document.getElementById('status').innerText = 'You are Online!';
    document.getElementById('status').style.color = 'green';
});

socket.on('disconnect', () => {
    console.log('Disconnected from server.');
    document.getElementById('status').innerText = 'Checking connection...';
    document.getElementById('status').style.color = 'red';
});

// Elements
const input = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('messages');

// Sending Message
function sendMessage() {
  const message = input.value.trim();
  if (message !== '') {
    // Emit the message with user info
    socket.emit('chat message', {
      text: message,
      user: currentUser
    });
    
    // Clear the input field
    input.value = '';
    
    // Emit the 'stop typing' event when the message is sent
    socket.emit('stop typing');
  }
}

// Listen for send button click
sendButton.addEventListener('click', sendMessage);

// Also send message on Enter key
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Typing event
input.addEventListener('input', () => {
  if (input.value.trim() !== '') {
    socket.emit('typing');
  } else {
    socket.emit('stop typing');
  }
});

// Receive chat messages
socket.on('chat message', (msg) => {
  addMessage(msg);
  hideTypingIndicator();
});

// Receive activity notifications
socket.on('activity', (message) => {
  addNotification(message);
});

// Typing indicators
socket.on('typing', () => {
  showTypingIndicator();
});

socket.on('stop typing', () => {
  hideTypingIndicator();
});

// Functions to update UI
function addMessage(msg) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  
  // Check if the message is from the current user
  if (msg.user === currentUser) {
    messageDiv.classList.add('you');
    messageDiv.textContent = msg.text;
  } else {
    messageDiv.classList.add('other');
    messageDiv.textContent = msg.text;
  }
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addNotification(message) {
  const notificationDiv = document.createElement('div');
  notificationDiv.classList.add('notification');
  notificationDiv.textContent = message;
  chatMessages.appendChild(notificationDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  if (!document.getElementById('typingIndicator')) {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'notification';
    typingDiv.textContent = '🖊️ Someone is typing...';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function hideTypingIndicator() {
  const typingDiv = document.getElementById('typingIndicator');
  if (typingDiv) {
    typingDiv.remove();
  }
}