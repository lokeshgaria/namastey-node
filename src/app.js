const express = require("express");
const { connectMongo } = require("./config/database");   // old method to connect with mongo v1
const { setupContainer } = require('./config/container'); // method to setup models container  v2
const { createServer } = require('http');    // for handling sockets for chat v1
const cors = require('cors');  // to enable cors v1
const cookieParser = require("cookie-parser"); // to handle cookies v1
require("dotenv").config();  // to use envs globally v1 
const setupV2Routes = require('./api/v2');
 
// Models
const { User } = require('./model/userSchema'); // user model import v1
const ConnectionRequest = require('./model/connectionRequest'); // connectionRequest model import v1
const Chat = require('./model/chat'); // chat model import v2
const Order = require('./model/Orders'); // order model import v2
// Infrastructure
const RedisClient = require('./infrastructure/cache/redis');  // to handle chaching with redis v2 
const setupMetricsRoutes = require('./api/v2/routes/metrics.routes')
// Middlewares
const { userAuth } = require('./middlewares/auth');  // to authenticate user token v1
const errorHandler = require('./api/middlewares/errorHandler');  // to handle errors gloablly v2


// OLD Routes (backup - we'll remove these later)
const authRouter = require("./routes/auth");   // v1
const userRouter = require("./routes/user");   // v1
const profileRouter = require("./routes/profile");   // v1
const requestRouter = require("./routes/request");   // v1
const chatRouter = require("./routes/chat");          // v1
const razorRouter = require("./routes/upgrade");     // v1

const { initializeSocket } = require('./utils/socket');    // imported socket intiliaze methos v1

const PORT = process.env.PORT || 3000;     // defining PORT v1
const app = express();   // INITIALIZING APP v1
const server = createServer(app);  // intializing server v1

// allowed CORs v1
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://13.60.188.185",
  "https://lovnti.in",
];

// Initialize Socket.io v1
initializeSocket(server);

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Raw body for webhooks v1
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());   // to convert repsonse to json
app.use(cookieParser());  // library called for cookies v1

// ============================================
// DEPENDENCY INJECTION SETUP  v2
// ============================================
const models = { User, ConnectionRequest, Chat, Order };  // defining the root models object for container setup v2
const container = setupContainer(models);  // passing the models object to container class v2

console.log('container', container)
// ============================================
// NEW ROUTES (Clean Architecture) v2
// ============================================

app.use('/api/v2', setupV2Routes(container, userAuth));

app.use('/api/v2/metrics', setupMetricsRoutes(container.get('cacheService')));

// ============================================
// OLD ROUTES (Keeping as backup) v1
// ============================================
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", razorRouter);
app.use("/", chatRouter); 

// ============================================
// ERROR HANDLING (Must be last)
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
// connectMongo()
//   .then(() => {
//     server.listen(PORT, () =>
//       console.log(`🚀 Server started on http://localhost:${PORT}`)
//     );
//   })
//   .catch((err) => {
//     console.error("❌ Mongo connect failed:", err);
//     process.exit(1);
//   });

  // Connect to Redis first
  RedisClient.connect().then(() => {
  // Then connect to MongoDB
  connectMongo()
    .then(() => {
      server.listen(PORT, () =>
        console.log(`🚀 Server started on http://localhost:${PORT}`)
      );
    })
    .catch((err) => {
      console.error("❌ Mongo connect failed:", err);
      process.exit(1);
    });
});

  // Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await RedisClient.disconnect().then(() => {
    console.log('Redis disconnected');
  });
  process.exit(0);
});

module.exports = app;