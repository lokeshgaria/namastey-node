const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required:true,
      ref:"User"
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required:true,
      ref:"User"
    },
    status: {
      type: String,
      enum: {
        values: ["rejected", "accepted", "interested", "ignored"],
        message: `{VALUE} is incorrect status type`,
      },
      required:true
    },
  },
  {
    timestamps: true,
  }
);

// connection request.find
connectionRequestSchema.index({fromUserId:1 , toUserId:1})
connectionRequestSchema.pre("save",function (next){
    const connectionRequest = this
   // check if fromuserId and toUserID   are same
   if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
   throw new Error("Cannot send connection request to yourself")
   }
   next()

})
const connectionRequestModel = new mongoose.model("ConnectionRequest",connectionRequestSchema)

module.exports = connectionRequestModel;
