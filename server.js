
const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your domain
    methods: ["GET", "POST"]
  }
});

// Store messages and users
const messages = [];
const users = [];

// Helper function to find and remove a user by ID
const removeUserById = (userId) => {
  const index = users.findIndex(user => user.id === userId);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return null;
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Get user info from query parameters
  const { userId, userName, userAvatar, isAdmin } = socket.handshake.query;
  
  if (!userId || !userName) {
    socket.disconnect();
    return;
  }
  
  // Create user object
  const user = {
    id: userId,
    name: userName,
    avatar: userAvatar || "😊",
    isAdmin: isAdmin === "true",
  };
  
  // Add user to users list, replacing any existing instance of the user
  removeUserById(userId);
  users.push(user);
  
  // Send list of online users to all clients
  io.emit("users", users);
  
  // Send previous messages to newly connected user
  socket.emit("previous_messages", messages);
  
  // Handle new messages
  socket.on("message", (message) => {
    console.log(`New message from ${message.sender.name}: ${message.text}`);
    messages.push(message);
    
    // Broadcast the message to all clients
    io.emit("message", message);
  });
  
  // Handle disconnections
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    const removedUser = removeUserById(userId);
    
    if (removedUser) {
      // Notify all clients that a user has left
      io.emit("users", users);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

// Simple endpoint to check if the server is running
app.get("/", (req, res) => {
  res.send("Chat server is running");
});
