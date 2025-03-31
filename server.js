
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

// Daily prompts that will rotate (now in Hebrew)
const dailyPrompts = [
  "שתפו במשהו אחד שאתם עובדים עליו היום!",
  "אמרו שלום והציגו את עצמכם למישהו חדש כאן.",
  "מהו טריק היעילות שלכם להיום?",
  "מה למדתם לאחרונה שהיה מעניין?",
  "קפה או תה? מה אתם מעדיפים היום?",
  "שתפו במשהו שעזר לכם השבוע!",
  "לגבי מה אתם מתרגשים כרגע?"
];

// System bot for automated messages
const systemBot = {
  id: "system",
  name: "רובוט BUTI",
  avatar: "🤖",
  isAdmin: true
};

// Track the last prompt time
let lastPromptDate = null;

// Helper function to find and remove a user by ID
const removeUserById = (userId) => {
  const index = users.findIndex(user => user.id === userId);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return null;
};

// Function to check if we should send a new daily prompt
const shouldSendDailyPrompt = () => {
  const now = new Date();
  // Check if it's after 9 AM local time
  const isAfter9AM = now.getHours() >= 9;
  
  // If we haven't sent a prompt today and it's after 9 AM
  if (!lastPromptDate || isAfter9AM) {
    // Check if the date has changed or if we haven't sent a prompt
    if (!lastPromptDate || now.toDateString() !== lastPromptDate.toDateString()) {
      return isAfter9AM; // Only return true if it's after 9 AM
    }
  }
  
  return false;
};

// Function to send the daily prompt
const sendDailyPrompt = () => {
  const now = new Date();
  
  // Select a prompt randomly
  const randomPrompt = dailyPrompts[Math.floor(Math.random() * dailyPrompts.length)];
  
  // Create the message object
  const promptMessage = {
    id: `prompt-${now.getTime()}`,
    sender: systemBot,
    text: randomPrompt,
    timestamp: now,
    isAutomated: true
  };
  
  // Add to messages and broadcast
  messages.push(promptMessage);
  io.emit("message", promptMessage);
  
  // Update the last prompt date
  lastPromptDate = now;
  
  console.log(`Daily prompt sent at ${now.toISOString()}: ${randomPrompt}`);
};

// Check for sending daily prompts every minute
setInterval(() => {
  if (shouldSendDailyPrompt()) {
    sendDailyPrompt();
  }
}, 60000); // Check every minute

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
  
  // Check if we should send a daily prompt now that a user has connected
  if (shouldSendDailyPrompt()) {
    sendDailyPrompt();
  }
  
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
