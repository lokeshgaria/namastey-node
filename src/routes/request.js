const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionRequestModel = require("../model/connectionRequest");
const { User } = require("../model/userSchema");
const requestRouter = express.Router();


// for left and right swipe
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res, next) => {
    const fromUser = req.user; // got this from token the logged in user
    const allowedStatus = ["ignored", "interested"];
    try {
      const fromUserId = fromUser._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid request " + status + " type");
      }

      const isRequestedToUser = await User.findById(toUserId);

      if (!isRequestedToUser) {
        throw new Error("Invalid user request!");
      }
      // IF there is an existing connectionRequest
      const existingConnectionRequest = await connectionRequestModel.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (existingConnectionRequest) {
        throw new Error("Connection request already exists!");
      }
      const connectionRequest = new connectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });

      const requestData = await connectionRequest.save();

      res.status(201).json({
        message: "connection request sent success",
        data: requestData,
        success:true
      });
    } catch (error) {
      res.status(400).send({ message: error.message, success: false });
    }
  }
);

requestRouter.post("/request/review/:status/:requestId",userAuth, async (req, res, next) => {
    
    const allowedStatus = ["accepted", "rejected"];
    try {
    
      const requestId = req.params.requestId;
      const status = req.params.status;

      const loggedInUser = req.user;
     // check the logged in user
     // status = intrested
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid request " + status + " type");
      }
    const connectionRequest = await connectionRequestModel.findOne({
        _id:requestId,
        toUserId:loggedInUser._id,
        status:"interested"
    })
    if(!connectionRequest){
        return res.status(404).json({
            message:"Connection request not found"
        })
    }
connectionRequest.status = status
     const data = await connectionRequest.save()
     res.json({message:"Connection request "+ status , data,success:true })
    } catch (error) {
      res.status(400).send({ message: error.message, success: false });
    }
  }
);

module.exports = requestRouter;
