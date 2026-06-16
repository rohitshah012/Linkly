const express = require("express");
const { ConnectMongo } = require("./connection/connectMongo");
const path = require("path");
const cookieParser = require("cookie-parser");
const {CheckForAuthentication , restrictTo} = require("./middlewares/auth");



const urlRoute = require("./routes/urlRoute");
const staticRoute = require("./routes/stasticRoute");
const userRoute = require("./routes/user")


const app = express();


// database connection
const mongoLink = "mongodb://localhost:27017/urlshort";
ConnectMongo(mongoLink);


// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.use(CheckForAuthentication);


//ejs setup
app.set("view engine", "ejs");
app.set("views" , path.resolve("./views"));


// Routes
app.use("/url", restrictTo(["NORMAL"]), urlRoute);
app.use("/user", userRoute)
app.use("/", staticRoute);




//Port
const PORT = 8002;

app.listen(PORT, () => console.log(`your server is running at PORT : ${PORT} `));
