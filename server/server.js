const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const { ConnectMongo, disconnectMongo } = require("./connection/connectMongo");
const { CheckForAuthentication } = require("./middlewares/auth");
const urlRoute = require("./routes/urlRoute");
const staticRoute = require("./routes/staticRoute");
const userRoute = require("./routes/user");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
}));
app.use(CheckForAuthentication);

//ejs setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/url", urlRoute);
app.use("/user", userRoute);
app.use("/", staticRoute);

const PORT = process.env.PORT || 5000;

app.use((req, res) => {
    res.status(404).send("Page not found.");
});

app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) return next(err);
    return res.status(500).send("Something went wrong. Please try again.");
});

async function startServer() {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        await ConnectMongo();
        const server = app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

        const shutdown = async (signal) => {
            console.log(`${signal} received. Shutting down...`);
            server.close(async () => {
                await disconnectMongo();
                process.exit(0);
            });
        };

        process.once("SIGINT", () => shutdown("SIGINT"));
        process.once("SIGTERM", () => shutdown("SIGTERM"));

        return server;
    } catch (error) {
        console.error("Unable to start server:", error.message);
        process.exitCode = 1;
        return null;
    }
}

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };
