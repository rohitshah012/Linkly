const express = require("express");
const { handleUserSignup } = require("../controllers/user");
const { handleUserLogin, handleAdminLogin } = require("../controllers/user")

const Router = express.Router();


Router.post('/', handleUserSignup)
Router.post('/login', handleUserLogin)
Router.post('/admin-login', handleAdminLogin)
Router.get('/logout', (req, res) => {
    res.clearCookie('uid');
    return res.redirect('/login');
})

module.exports = Router;
