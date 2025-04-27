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

// Socket.io connections
io.on('connection', (socket) => {
  console.log('🔵 A user connected');
  socket.broadcast.emit('activity', '🌟 A new user has joined the chat!');

  // Handle chat messages
  socket.on('chat message', (msg) => {
    console.log('Received message:', msg);  // Log the received message
    io.emit('chat message', msg);  // Broadcast the message to all clients
  });

  // Handle typing events
  socket.on('typing', () => {
    console.log('Someone is typing...');
    socket.broadcast.emit('typing');  // Notify other users that someone is typing
  });

  socket.on('stop typing', () => {
    console.log('Typing stopped...');
    socket.broadcast.emit('stop typing');  // Notify other users that typing has stopped
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
    socket.broadcast.emit('activity', '👋 A user has left the chat.');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});