const app = require('./app');
const connectDB = require('./src/config/db');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io chat logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a request room
  socket.on('join_room', (requestId) => {
    socket.join(requestId);
    console.log(`User joined room: ${requestId}`);
  });

  // Send message
  socket.on('send_message', (data) => {
    io.to(data.requestId).emit('receive_message', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in controllers
app.set('io', io);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});