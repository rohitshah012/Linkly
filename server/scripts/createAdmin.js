const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");
const { User } = require("../models/user");

dotenv.config();

async function createAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME?.trim() || "Admin";

        if (!process.env.MONGO_URI || !adminEmail || !adminPassword) {
            throw new Error("MONGO_URI, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            const wasAdmin = existingAdmin.role === "ADMIN";
            existingAdmin.role = "ADMIN";
            existingAdmin.password = await bcrypt.hash(adminPassword, 10);
            existingAdmin.name = adminName;
            await existingAdmin.save();
            console.log(wasAdmin ? "Admin credentials updated" : "Existing user promoted to admin");
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN"
        });

        console.log("Admin user created successfully");
        console.log("Email:", adminEmail);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin();
