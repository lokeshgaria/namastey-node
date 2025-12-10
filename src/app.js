const express = require("express");
const { connectMongo } = require("./database");
const { User } = require("./model/userSchema");

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());

app.post("/users", async (req, res, next) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send({ message: "user added successfully", user });
  } catch (e) {
    next(e);
  }
});

app.get("/user", async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.find({ email: email });

    if (user.length === 0) {
      res.status(404).send({ message: "user not found" });
    } else {
      res.status(200).send({ message: "users fetched successfully", user });
    }
  } catch (e) {
    next(e);
  }
});

app.get("/feed", async (req, res, next) => {
  try {
    const users = await User.find({})

    if(users.length === 0){ 
      res.status(404).send({message:"no users found",success:false})
    }else{
      res.status(200).send({message:"users fetched successfully",users,success:true})
    }
  } catch (e) {
    next(e)
  }
})  

app.delete("/user", async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await User.deleteOne({ email: email });

    if (user.deletedCount === 0) {
      res.status(404).send({ message: "user not found" });
    } else {
      res.status(200).send({ message: "user deleted successfully", user });
    }
  } catch (e) {
    next(e);
  }
});


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
