const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {type:String,required:true},
  lastName: String,
  email: { type: String  , unique:true,required:true},
  age: Number,
});

const User =  mongoose.model("User", userSchema);
module.exports = { User };
