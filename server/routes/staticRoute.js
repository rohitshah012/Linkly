const express = require("express");
const { URL } = require("../models/url");
const { User } = require("../models/user");
const { restrictTo } = require("../middlewares/auth");

const router = express.Router();

function getBaseUrl(req) {
    return (process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/+$/, "");
}

router.get("/health", (req, res) => {
    return res.json({ status: "ok" });
});

router.get("/admin/urls", restrictTo(["ADMIN"]), async (req, res, next) => {
    try {
        const [allUsers, allUrls] = await Promise.all([
            User.find({ role: "NORMAL" }).sort({ createdAt: -1 }).lean(),
            URL.find({}).sort({ createdAt: -1 }).lean(),
        ]);
        const urlsByUser = new Map();

        allUrls.forEach((url) => {
            const ownerId = url.Createdby?.toString();
            if (!ownerId) return;
            if (!urlsByUser.has(ownerId)) urlsByUser.set(ownerId, []);
            urlsByUser.get(ownerId).push(url);
        });

        const usersWithStats = allUsers.map((user) => {
            const urls = urlsByUser.get(user._id.toString()) || [];
            return {
                name: user.name,
                email: user.email,
                totalUrls: urls.length,
                totalVisits: urls.reduce((sum, url) => sum + url.VisitHistory.length, 0),
                urls,
            };
        });

        return res.render("admin", {
            users: usersWithStats,
            user: req.user,
            baseUrl: getBaseUrl(req),
        });
    } catch (error) {
        return next(error);
    }
});

router.get("/", async (req, res, next) => {
    try {
        if (req.user?.role === "ADMIN") {
            return res.redirect("/admin/urls");
        }

        if (!req.user) {
            return res.render("index", {
                urls: [],
                user: null,
                baseUrl: getBaseUrl(req),
            });
        }

        const allurls = await URL.find({ Createdby: req.user._id }).sort({ createdAt: -1 });
        const createdId = req.query.created;
        const createdUrl = createdId
            ? await URL.findOne({ Shortid: createdId, Createdby: req.user._id })
            : null;

        return res.render("index", {
            urls: allurls,
            user: req.user,
            id: createdUrl?.Shortid,
            baseUrl: getBaseUrl(req),
        });
    } catch (error) {
        return next(error);
    }
});

router.get("/signup", (req, res) => {
    if (req.user) {
        return res.redirect(req.user.role === "ADMIN" ? "/admin/urls" : "/");
    }

    return res.render("signup", { formData: {} });
});

router.get("/login", (req, res) => {
    if (req.user) {
        return res.redirect(req.user.role === "ADMIN" ? "/admin/urls" : "/");
    }

    return res.render("login", {
        mode: req.query.mode === "admin" ? "admin" : "user",
        success: req.query.registered === "1" ? "Account created. You can now log in." : null,
        email: "",
        next: req.query.next || "",
    });
});

module.exports = router;
