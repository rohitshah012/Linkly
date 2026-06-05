const express = require("express");
const { handleUserSignup } = require("../controllers/user");
const { handleUserLogin } = require("../controllers/user")

const Router = express.Router();


Router.post('/', handleUserSignup)
Router.post('/login', handleUserLogin)

module.exports = Router;
