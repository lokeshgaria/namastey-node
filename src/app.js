const express = require("express");
const { connectMongo } = require("./config/database");
 
const cookieParser = require("cookie-parser");
require("dotenv").config();
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");


const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());
app.use(cookieParser());

 
app.use("/",authRouter)
app.use("/",userRouter)
app.use("/",profileRouter)
app.use("/",requestRouter)

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
