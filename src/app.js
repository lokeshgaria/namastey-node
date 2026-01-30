const express = require("express");
const { connectMongo } = require("./config/database");   // old method to connect with mongo v1
const { setupContainer } = require('./config/container'); // method to setup models container  v2
const { createServer } = require('http');    // for handling sockets for chat v1
const cors = require('cors');  // to enable cors v1
const cookieParser = require("cookie-parser"); // to handle cookies v1
const CacheService = require("./infrastructure/cache/CacheService")
require("dotenv").config();  // to use envs globally v1 
const setupV2Routes = require('./api/v2');
const mongoose = require('mongoose');
const metricsCollector = require('./infrastructure/monitoring/MetricsCollector');
// Routes
const setupHealthRoutes = require('./api/v2/routes/health.routes');
 

// Logger (import FIRST)
const logger = require('./infrastructure/logging/logger');
const setupQueryLogging = require('./infrastructure/database/queryLogger');
const requestLogger = require('./api/middlewares/requestLogger');
const metricsMiddleware = require('./api/middlewares/metricsMiddleware');
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

// ============================================
// MIDDLEWARE SETUP (ORDER MATTERS!)
// ============================================

// 1. Request logging (FIRST - before any other middleware)
app.use(requestLogger);

// 2. Metrics collection
app.use(metricsMiddleware);
// 3. Body parsing | Raw body for webhooks v1
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  },
}));

// 4. CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// 5. Cookie parser
app.use(cookieParser());

// Initialize Socket.io v1
initializeSocket(server);

// ============================================
// MIDDLEWARE SETUP
// ============================================



// CORS


// app.use(express.json());   // to convert repsonse to json
//app.use(cookieParser());  // library called for cookies v1

// ============================================
// DEPENDENCY INJECTION SETUP  v2
// ============================================

// ============================================
// INITIALIZE SERVICES
// ============================================
let container;
let cacheService;



//const container = setupContainer(models);  // passing the models object to container class v2
async function initializeApp() {
  try {
    logger.info('🚀 Starting DevTinder API...');

    // 1. Connect to Redis
    await RedisClient.connect();
    cacheService = new CacheService(RedisClient);
    logger.info('✅ Cache service initialized');

    // 2. Connect to MongoDB
    await connectMongo();

    // 3. Setup query logging
    setupQueryLogging(mongoose);

    logger.info('✅ Database connected and query logging enabled');

    // 4. Setup dependency injection
    const models = { User, ConnectionRequest, Chat, Order };  // defining the root models object for container setup v2
    container = setupContainer(models, RedisClient);
    logger.info('✅ Dependency injection container ready');

    // ============================================
    // ROUTES
    // ============================================

    // Health check routes (public)
    app.use('/api/health', setupHealthRoutes(RedisClient, cacheService));

    // NEW Architecture routes
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

    logger.info('✅ Routes registered');

    // ============================================
    // ERROR HANDLING (MUST BE LAST)
    // ============================================
    app.use(errorHandler);

    // ============================================
    // START SERVER
    // ============================================
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`📈 Metrics: http://localhost:${PORT}/api/health/metrics`);

      // Log initial metrics
      metricsCollector.logMetrics();
    });

  } catch (error) {
    logger.error('❌ Failed to start application', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}
 
// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
  });

  // Disconnect from services
  await RedisClient.disconnect();
  await mongoose.connection.close();
  
  logger.info('All connections closed, exiting');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });

  await RedisClient.disconnect();
  await mongoose.connection.close();
  
  logger.info('All connections closed, exiting');
  process.exit(0);
});

// ============================================
// UNCAUGHT ERRORS (Already handled by Winston)
// ============================================
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  // Winston will log to exceptions.log
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason,
    promise
  });
  // Winston will log to rejections.log
});

// Start the application
initializeApp();

module.exports = app;