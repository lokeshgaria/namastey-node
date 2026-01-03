const jwt = require("jsonwebtoken");
const { User } = require("../model/userSchema");
const { ERRORS } = require("../utils/constants/Errors");
const { SUCCESS } = require("../utils/constants/Success");
const adminAuth = (req, res, next) => {
  console.log("admin is geting check");
  const token = "xyz";
  const isAdmin = token === "abc";
  if (!isAdmin) {
    res.send(401).send("Unauthorized request");
  } else {
    next();
  }
};

const userAuth = async (req, res, next) => {

   try {
        //Read the token from request cookie
  const cookies = req.cookies;
  const { token } = cookies;
  if(!token){
   throw new Error("Token is not valid")
  }
  //validate the token
  const decodedObj = await jwt.verify(token, process.env.JWT_ENCODE_KEY);
  const { _id } = decodedObj;
 
  //find the username
  const user =  await User.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
  req.user=user
  next();
   } catch (error) {
      res.status(401).send({message:  error.message,success:false})
   }

};

module.exports = { adminAuth, userAuth };
