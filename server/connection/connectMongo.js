const mongoose = require('mongoose');

async function ConnectMongo() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
}

async function disconnectMongo() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
}

module.exports = {
    ConnectMongo,
    disconnectMongo,
};
