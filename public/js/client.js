const socket = io();

// User information
let currentUsername = '';
let currentUserColor = '';

// Elements
const input = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('messages');
const statusElement = document.getElementById('status');
const userListElement = document.getElementById('userList');

// Generate a random color for the user
function generateUserColor() {
  const colors = ['#d8a48f', '#a48fd8', '#8fd8a4', '#d88f8f', '#8fa4d8'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Connection status
socket.on('connect', () => {
  console.log('Connected to server.');
  statusElement.innerText = 'You are Online!';
  statusElement.style.color = 'green';
  currentUserColor = generateUserColor();
});

socket.on('disconnect', () => {
  console.log('Disconnected from server.');
  statusElement.innerText = 'Offline - Trying to reconnect...';
  statusElement.style.color = 'red';
});

// Handle user connection
socket.on('user connected', (data) => {
  currentUsername = data.username;
  updateUserList(data.userList);
});

// Update user list
function updateUserList(users) {
  if (!users || users.length === 0) {
    userListElement.innerHTML = '<div class="user-list-empty">No users online</div>';
    return;
  }

  userListElement.innerHTML = users.map(user => `
    <div class="user-item ${user === currentUsername ? 'current-user' : ''}">
      <span class="user-status-indicator"></span>
      ${user} ${user === currentUsername ? '(You)' : ''}
    </div>
  `).join('');
}

// Handle user list updates
socket.on('update user list', (users) => {
  updateUserList(users);
});

// Sending Message
function sendMessage() {
  const message = input.value.trim();
  if (message !== '') {
    socket.emit('chat message', {
      text: message,
      color: currentUserColor
    });
    input.value = '';
    socket.emit('stop typing');
  }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Typing indicators
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

// Add message to chat
function addMessage(msg) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  
  if (msg.user === currentUsername) {
    messageDiv.classList.add('you');
    messageDiv.style.backgroundColor = msg.color || '#d8a48f';
  } else {
    messageDiv.classList.add('other');
    messageDiv.style.backgroundColor = msg.color || '#f5deb3';
  }

  messageDiv.innerHTML = `
    <div class="message-header">
      <span class="username">${msg.user}</span>
      <span class="timestamp">${msg.timestamp || ''}</span>
    </div>
    <div class="message-text">${msg.text}</div>
  `;
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Activity notifications
socket.on('activity', (notification) => {
  const notificationDiv = document.createElement('div');
  notificationDiv.classList.add('notification');
  notificationDiv.textContent = notification.text;
  chatMessages.appendChild(notificationDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Typing indicators
socket.on('typing', (data) => {
  if (data.user !== currentUsername) {
    showTypingIndicator(data.user);
  }
});

socket.on('stop typing', () => {
  hideTypingIndicator();
});

function showTypingIndicator(username) {
  if (!document.getElementById('typingIndicator')) {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'typing-indicator';
    typingDiv.textContent = `✏️ ${username} is typing...`;
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