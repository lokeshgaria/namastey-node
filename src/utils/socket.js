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
