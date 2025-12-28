 
const mongoose = require("mongoose");

let isConnected = false;

async function connectMongo() {
  if (isConnected) return mongoose.connection;

  const DB_USER = process.env.DB_USER || "lokeshgaria8811";                 // put in .env
  const DB_PASS = encodeURIComponent(process.env.DB_PASS || "gTSmd2zxHuhFsqDf"  ); // encode if special chars
  const DB_NAME = process.env.DB_NAME || "devTinder";
 
  const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASS}@node-by-akshay.wxvdczb.mongodb.net/`;
 
  mongoose.set("strictQuery", true);
  // optional: fail fast instead of buffering ops
  // mongoose.set("bufferCommands", false);

  await mongoose.connect(MONGO_URI, {
    dbName:DB_NAME,
    serverSelectionTimeoutMS: 10000,
  });

  isConnected = true;
  console.log("✅ Mongoose connected:", mongoose.connection.host);
  return mongoose.connection;
}

module.exports = { connectMongo };
