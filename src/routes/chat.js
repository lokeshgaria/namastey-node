const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../model/chat");
const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  try {
    // let chat = await Chat.findOne({
    //   participants: { $all: [userId, targetUserId] },
    // });

    let chat = await Chat.findOne({
        participants: { $all: [userId, targetUserId] },
      })  .populate({
        path: "participants",
        select: "firstName lastName photoUrl",
      })
      .populate({
        path: "messages.senderId",
        select: "firstName lastName photoUrl",
      });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });

      await chat.save();
      await chat.populate({
        path: "participants",
        select: "firstName lastName photoUrl",
      });
    }

    res.status(200).send({ message: "Chat fetched successfully", success: true, data: chat });
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: error.message, success: false });
  }
});

module.exports = chatRouter;
