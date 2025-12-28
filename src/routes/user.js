const express = require("express");
const { SUCCESS } = require("../utils/constants/Success/index");
const { User } = require("../model/userSchema");
const { userAuth } = require("../middlewares/auth");
const connectionRequestModel = require("../model/connectionRequest");
const userRouter = express.Router();

const USER_SAFE_DATA= "firstName lastName age photoUrl"
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
      connectionRequest,
      success: true,
    });
  } catch (error) {
    res.status(400).send({
      message: "ERROR :" + error.message,
         success:false
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const allConectionRequest = await connectionRequestModel.find({
      $or:[
        {toUserId:loggedInUser._id , status:"accepted"},
        {fromUserId:loggedInUser._id,status:"accepted"}
      ],
      
    }).populate("fromUserId",USER_SAFE_DATA).populate("toUserId",USER_SAFE_DATA)

    const data = allConectionRequest.map((row) => {
    
    if(row.fromUserId._id.toString() === loggedInUser._id.toString()){
  return row.toUserId
    }
    return row.fromUserId
    })
    res.send({
      message:SUCCESS.DATA_FETCHED,
      data,
      success:true
    })
  } catch (error) {
    res.status(400).send({
      message: "ERROR :" + error.message,
      success:false
    });
  }
});
// userRouter.get("/user", async (req, res, next) => {
//   try {

//     const email = req.body.email;
//     const user = await User.find({ email: email });

//     if (user.length === 0) {
//       res.status(404).send({ message: "user not found" });
//     } else {
//       res.status(200).send({ message: "users fetched successfully", user });
//     }
//   } catch (error) {
//     res.status(400).send("Something went wrong :" + error.message);
//   }
// });

// userRouter.get("/feed", async (req, res, next) => {
//   try {
//     const users = await User.find({});

//     if (users.length === 0) {
//       res.status(404).send({ message: "no users found", success: false });
//     } else {
//       res
//         .status(200)
//         .send({ message: SUCCESS.DATA_FETCHED, users, success: true });
//     }
//   } catch (error) {
//     res.status(400).send("Something went wrong :" + error.message);
//   }
// });

// userRouter.delete("/user", async (req, res, next) => {
//   try {
//     const email = req.body.email;
//     const user = await User.deleteOne({ email: email });

//     if (user.deletedCount === 0) {
//       res.status(404).send({ message: "user not found" });
//     } else {
//       res.status(200).send({ message: "user deleted successfully", user });
//     }
//   } catch (error) {
//     res.status(400).send("Something went wrong :" + error.message);
//   }
// });

// userRouter.patch("/user", async (req, res) => {
//   const userId = req.body.userId;
//   const data = req.body;

//   try {
//     await User.findByIdAndUpdate({ _id: userId }, data, {
//       returnDocument: "after",
//       runValidators: true,
//     });
//     res.send("User updated succesfully.");
//   } catch (error) {
//     res.status(400).send("Something went wrong :" + error.message);
//   }
// });

module.exports = userRouter;
