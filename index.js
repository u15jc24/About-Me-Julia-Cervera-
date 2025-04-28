const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/home.html');
});

// Serve about page
app.get('/about.html', (req, res) => {
  res.sendFile(__dirname + '/public/aboutme.html');
});

// Serve chat page
app.get('/chat.html', (req, res) => {
  res.sendFile(__dirname + '/public/chat.html');
});

// Store connected users
const users = new Map();

// Socket.io connections
io.on('connection', (socket) => {
  console.log('🔵 A user connected');
  
  // Generate a random username for the user
  const username = `User-${Math.floor(Math.random() * 1000)}`;
  users.set(socket.id, username);
  
  // Notify everyone about the new connection
  io.emit('activity', {
    type: 'notification',
    text: `🌟 ${username} has joined the chat!`
  });

  // Send the user their username
  socket.emit('user connected', username);

  // Handle chat messages
  socket.on('chat message', (msg) => {
    console.log('Received message:', msg);
    
    // Broadcast the message to all clients with username
    io.emit('chat message', {
      text: msg.text,
      user: users.get(socket.id),
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Handle typing events
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      user: users.get(socket.id)
    });
  });

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing');
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
    const disconnectedUser = users.get(socket.id);
    users.delete(socket.id);
    
    io.emit('activity', {
      type: 'notification',
      text: `👋 ${disconnectedUser} has left the chat.`
    });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});