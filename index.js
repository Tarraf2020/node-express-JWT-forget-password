const express = require("express");
const app = express();
const DB = require("./database").connectDB; // we are only refering to it

// Routes
const authRouter = require("./routers/authRoutes");
const categoryRouter = require("./routers/categoryRoutes");
const itemRouter = require("./routers/itemRoutes");

// Connect to our db
DB();

app.use(express.json()); //just accept json format data
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/item", itemRouter);

app.listen(process.env.PORT, () => {
  console.log("listening on port " + process.env.PORT);
});
