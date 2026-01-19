const express = require("express");
const connectionRoutes = require("./routes/connection.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const feedRoutes = require("./routes/feed.routes");


function setupV2Routes(container, userAuth) {
  const router = express.Router();

  // Get controller from container
  const connectionController = container.get("connectionController");
  const authController = container.get("authController");
  const userController = container.get("userController");
  const feedController = container.get("feedController");
  // Mount connection routes
  router.use("/connections", connectionRoutes(connectionController, userAuth));
  router.use("/auth", authRoutes(authController, userAuth));  
  router.use("/user", userRoutes(userController, userAuth));
  router.use("/feed", feedRoutes(feedController, userAuth));
  // API Documentation with HTML/JSON support
  router.get("/", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}/api/v2`;
    const acceptsHtml = req.accepts("html");
    const format = req.query.format;

    // Force HTML if ?format=html is specified
    if (format === "html" || (acceptsHtml && format !== "json")) {
      // Send HTML response
      res.send(getHtmlDocumentation(baseUrl));
    } else {
      // Send JSON response
      res.json(getJsonDocumentation(baseUrl));
    }
  });

  // Health check endpoint
  router.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "dating-api-v2",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    });
  });

  return router;
}

// Helper function for HTML documentation
function getHtmlDocumentation(baseUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Dating API v2 Docs</title>
      <style>/* CSS from above */</style>
    </head>
    <body>
      <!-- HTML from above -->
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dating API v2 Documentation</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          h1 {
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
          }
          .endpoint { 
            background: #f8f9fa; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px;
            border-left: 4px solid #667eea;
            transition: transform 0.2s;
          }
          .endpoint:hover {
            transform: translateX(5px);
            background: #f1f3f5;
          }
          .method { 
            display: inline-block; 
            padding: 6px 12px; 
            border-radius: 4px; 
            color: white; 
            margin-right: 10px;
            font-weight: bold;
            font-size: 14px;
          }
          .get { background: #61affe; }
          .post { background: #49cc90; }
          .put { background: #fca130; }
          .delete { background: #f93e3e; }
          .path { 
            font-family: 'Courier New', monospace; 
            color: #333;
            font-size: 16px;
          }
          .description {
            color: #666;
            margin-top: 8px;
          }
          .base-url {
            background: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            margin: 20px 0;
          }
          .endpoint-list {
            margin-top: 30px;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 10px;
            background: #28a745;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            margin-left: 10px;
          }
          .test-button {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 15px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 14px;
          }
          .test-button:hover {
            background: #5a67d8;
          }
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      </head>
      <body>
        <div class="container">
          <h1>
            <i class="fas fa-heart"></i> Dating App API v2 Documentation
            <span class="status-badge"><i class="fas fa-circle"></i> Online</span>
          </h1>
          
          <div class="base-url">
            <i class="fas fa-link"></i> Base URL: <code>${baseUrl}</code>
          </div>
          
          <h2><i class="fas fa-key"></i> Authentication</h2>
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/auth/login</span>
            <p class="description">Login user and get JWT token</p>
            <a href="#" class="test-button">Test in Postman</a>
          </div>
          
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/auth/register</span>
            <p class="description">Register new user</p>
            <a href="#" class="test-button">Test in Postman</a>
          </div>
          
          <h2><i class="fas fa-users"></i> Connections</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/connections</span>
            <p class="description">Get all accepted connections (requires auth)</p>
          </div>
          
          <div class="endpoint">
            <span class="method post">POST</span>
            <span class="path">/connections/requests/:userId</span>
            <p class="description">Send connection request to another user</p>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/connections/requests/received</span>
            <p class="description">Get pending connection requests</p>
          </div>
          
          <h2><i class="fas fa-user"></i> User Profile</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/users/profile</span>
            <p class="description">Get current user profile</p>
          </div>
          
          <div class="endpoint">
            <span class="method put">PUT</span>
            <span class="path">/users/profile</span>
            <p class="description">Update user profile</p>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/feed</span>
            <p class="description">Get discovery feed of potential matches</p>
          </div>
          
          <h2><i class="fas fa-cogs"></i> System</h2>
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/health</span>
            <p class="description">Check API health status</p>
            <a href="${baseUrl}/health" class="test-button">Check Health</a>
          </div>
          
          <div class="endpoint">
            <span class="method get">GET</span>
            <span class="path">/ (this page)</span>
            <p class="description">API documentation - returns JSON if Accept header not HTML</p>
            <a href="${baseUrl}?format=json" class="test-button">View JSON</a>
          </div>
          
          <h2><i class="fas fa-bolt"></i> Quick Test</h2>
          <div class="endpoint">
            <p><strong>Test Authentication:</strong></p>
            <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
curl -X POST ${baseUrl}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com", "password": "password123"}'</pre>
          </div>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
            <p><i class="fas fa-code"></i> Built with Express.js | <i class="fas fa-clock"></i> ${new Date().toLocaleString()}</p>
            <p><i class="fas fa-info-circle"></i> For full API documentation, include header: <code>Accept: application/json</code></p>
          </div>
        </div>
      </body>
      </html>
    `;
}

// Helper function for JSON documentation
function getJsonDocumentation(baseUrl) {
  return {
    api: {
      name: "Dating App API v2",
      version: "2.0.0",
      baseUrl: baseUrl,
      documentation: `${baseUrl}?format=html`,
    },
    endpoints: {
      connections: {
        get: `${baseUrl}/connections`,
        post_request: `${baseUrl}/connections/requests/{userId}`,
        get_requests: `${baseUrl}/connections/requests/received`,
      },
    },
    timestamp: new Date().toISOString(),
  };
}

module.exports = setupV2Routes;
