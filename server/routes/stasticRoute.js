const express = require("express");
const { URL } = require("../models/url");
const { User } = require("../models/user");
const { restrictTo } = require("../middlewares/auth");

const Router = express.Router();

Router.get('/admin/urls', restrictTo(["ADMIN"]), async (req, res) => {
    try {
        const allUsers = await User.find({});
        
        // Get URLs and statistics for each user
        const usersWithStats = await Promise.all(
            allUsers.map(async (user) => {
                const urls = await URL.find({ Createdby: user._id });
                const totalVisits = urls.reduce((sum, url) => sum + url.VisitHistory.length, 0);
                
                return {
                    name: user.name,
                    email: user.email,
                    totalUrls: urls.length,
                    totalVisits: totalVisits,
                    urls: urls
                };
            })
        );

        return res.render("admin", {
            users: usersWithStats,
            user: req.user,
        });
    } catch (error) {
        return res.status(500).json({ msg: "Failed to fetch admin data" });
    }
});

Router.get('/', restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {

  
    const allurls = await URL.find({ Createdby: req.user._id });

    return res.render("home", {
        urls: allurls,
        user: req.user,
    });
});

Router.get('/signup', (req, res)=>{
    return res.render("signup")
})

Router.get('/login', (req, res)=>{
    return res.render("login")
})

module.exports = Router;
