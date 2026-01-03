const express = require("express");
const { SUCCESS } = require("../utils/constants/Success/index");
const { User } = require("../model/userSchema");
const { userAuth } = require("../middlewares/auth");
const connectionRequestModel = require("../model/connectionRequest");
const { ERRORS } = require("../utils/constants/Errors");
const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName age photoUrl skills about email ";
// GET all the pending connection request for the loggedin user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await connectionRequestModel
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", USER_SAFE_DATA);

    res.send({
      message: SUCCESS.DATA_FETCHED,
      data: connectionRequest,
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "ERROR :" + error.message,
      success: false,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const allConectionRequest = await connectionRequestModel
      .find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = allConectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.send({
      message: SUCCESS.DATA_FETCHED,
      data,
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "ERROR :" + error.message,
      success: false,
    });
  }
});

userRouter.get("/feed", userAuth, async (req, res, next) => {
  try {
    //FOR PAGINATION
    const pageNumber = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    limit = limit > 50 ? 50 : limit;

    const skipcount = (pageNumber - 1) * limit;

    //Ex-Akshay , Elon, MARK, ...,

    //find all connection request (sent + received)

    const loggedInUser = req.user;

    const connectionList = await connectionRequestModel
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId");
    //.populate("fromUserId","firstName").populate("toUserId","firstName")

    const hideUsersFromFeed = new Set();
    connectionList.forEach((request) => {
      hideUsersFromFeed.add(request.fromUserId.toString());
      hideUsersFromFeed.add(request.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skipcount)
      .limit(limit);
    res.send({ data: users, message: SUCCESS.DATA_FETCHED, success: true });
  } catch (error) {
    res.status(400).send({ message: error.message, success: false });
  }
});

module.exports = userRouter;
