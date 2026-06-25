const { User } = require("../models/user");
const { setuser } = require("../service/auth");
const bcrypt = require("bcrypt");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function renderSignup(res, status, error, formData = {}) {
    return res.status(status).render("signup", { error, formData });
}

function renderLogin(res, status, error, email = "", mode = "user", next = "") {
    return res.status(status).render("login", { error, email, mode, next });
}

function getSafeRedirect(value, fallback = "/") {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
        return fallback;
    }

    return value;
}

async function verifyPasswordAndUpgrade(user, password) {
    const usesBcrypt = /^\$2[aby]\$\d{2}\$/.test(user.password);

    if (usesBcrypt) {
        return bcrypt.compare(password, user.password);
    }

    if (user.password !== password) {
        return false;
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    return true;
}

async function handleUserSignup(req, res) {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    const formData = { name: name || "", email: email || "" };

    if (!name || !email || !password) {
        return renderSignup(res, 400, "All fields are required.", formData);
    }

    if (!emailRegex.test(email)) {
        return renderSignup(res, 400, "Enter a valid email address.", formData);
    }

    if (!strongPasswordRegex.test(password)) {
        return renderSignup(
            res,
            400,
            "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
            formData
        );
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return renderSignup(res, 409, "Email already registered. Please log in.", formData);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return res.redirect("/login?registered=1");
    } catch (error) {
        if (error?.code === 11000) {
            return renderSignup(res, 409, "Email already registered. Please log in.", formData);
        }

        console.error("Signup error:", error);
        return renderSignup(res, 500, "Unable to create your account right now.", formData);
    }
}

async function handleUserLogin(req, res) {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    const nextUrl = getSafeRedirect(req.body.next);

    if (!email || !password) {
        return renderLogin(res, 400, "Email and password are required.", email, "user", nextUrl);
    }

    try {
        const user = await User.findOne({ email });

        if (!user || !(await verifyPasswordAndUpgrade(user, password))) {
            return renderLogin(res, 401, "Invalid email or password.", email, "user", nextUrl);
        }

        res.cookie("uid", setuser(user), cookieOptions);

        return res.redirect(user.role === "ADMIN" ? "/admin/urls" : nextUrl);
    } catch (error) {
        console.error("Login error:", error);
        return renderLogin(res, 500, "Unable to log in right now.", email, "user", nextUrl);
    }
}

async function handleAdminLogin(req, res) {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    const nextUrl = getSafeRedirect(req.body.next, "/admin/urls");

    if (!email || !password) {
        return renderLogin(res, 400, "Email and password are required.", email, "admin", nextUrl);
    }

    try {
        const admin = await User.findOne({ email });

        if (!admin || admin.role !== "ADMIN") {
            return renderLogin(res, 401, "Invalid admin credentials.", email, "admin", nextUrl);
        }

        if (!(await verifyPasswordAndUpgrade(admin, password))) {
            return renderLogin(res, 401, "Invalid admin credentials.", email, "admin", nextUrl);
        }

        res.cookie("uid", setuser(admin), cookieOptions);

        return res.redirect(nextUrl);
    } catch (error) {
        console.error("Admin login error:", error);
        return renderLogin(res, 500, "Unable to log in right now.", email, "admin", nextUrl);
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleAdminLogin,
};
