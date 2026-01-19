const socket = require("socket.io");
const Chat = require("../model/chat");
const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    //handle event

    socket.on("join-room", ({ userName, targetUserId, loggedInUserId }) => {
      const room = [targetUserId, loggedInUserId].sort().join("-");
      const roomExists = io.sockets.adapter.rooms.has(room);

      console.log(`${userName} has joined the room ${room}`);
      socket.join(room); // Always join
      socket.emit("room-joined", {
        message: `${userName} has joined the room ${room}`,
      });
    });

    socket.on(
      "sendMessage",
      async ({ senderName, loggedInUserId, targetUserId, message }) => {
        const room = [targetUserId, loggedInUserId].sort().join("-");

        try {
          console.log(`${senderName} has sent a  ${message}`);

          let chat = await Chat.findOne({
            participants: { $all: [loggedInUserId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [loggedInUserId, targetUserId],
              messages: [],
            });
          }
          
          // Push message to chat (works for both new and existing chats)
          chat.messages.push({
            senderId: loggedInUserId,
            text: message,
          });
          await chat.save();

       
          io.to(room).emit("receiveMessage", {
            id: new Date().getTime(),
            text: message,
            sender: senderName,
            senderId: loggedInUserId, // Add this!
            timestamp: new Date(),
            status: "seen",

            
          });
        } catch (error) {
          console.log("error", error);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
module.exports = { initializeSocket };


// NEW SOCKET IMPLEMNTATION 
// const socketIO = require('socket.io');
// const jwt = require('jsonwebtoken');
// const User = require('../model/userSchema');

// let io;

// const initializeSocket = (server) => {
//   io = socketIO(server, {
//     cors: {
//       origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//       credentials: true
//     }
//   });

//   // Authentication middleware
//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       if (!token) {
//         return next(new Error('Authentication error'));
//       }

//       const decoded = jwt.verify(token, process.env.JWT_ENCODE_KEY);
//       const user = await User.findById(decoded._id);
      
//       if (!user) {
//         return next(new Error('User not found'));
//       }

//       socket.userId = user._id.toString();
//       socket.user = user;
//       next();
//     } catch (error) {
//       next(new Error('Authentication error'));
//     }
//   });

//   // Connection event
//   io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.userId}`);

//     // Join personal room
//     socket.join(`user:${socket.userId}`);

//     // Handle chat events
//     socket.on('message:send', async (data) => {
//       const { receiverId, content } = data;
      
//       // Emit to receiver
//       io.to(`user:${receiverId}`).emit('message:receive', {
//         senderId: socket.userId,
//         content,
//         timestamp: new Date()
//       });
//     });

//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.userId}`);
//     });
//   });

//   return io;
// };

// const getIO = () => {
//   if (!io) {
//     throw new Error('Socket.io not initialized');
//   }
//   return io;
// };

// module.exports = { initializeSocket, getIO };