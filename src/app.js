const express = require("express");
const { connectMongo } = require("./config/database");
const cors = require('cors')
const cookieParser = require("cookie-parser");
require("dotenv").config();
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const razorRouter = require("./routes/upgrade")
//  require("./utils/cronjob");

const PORT = process.env.PORT;
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://13.60.188.185",
  "https://lovnti.in",
  
];

 // Add this BEFORE app.use(express.json())
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // We save the original raw body here
    },
  })
);
 
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman, curl)
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
app.use(express.json());
app.use(cookieParser());

 
app.use("/",authRouter)
app.use("/",userRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)
app.use("/",razorRouter)

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

connectMongo()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 server started on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Mongo connect failed:", err);
    process.exit(1);
  });
