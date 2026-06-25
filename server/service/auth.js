const jwt = require("jsonwebtoken");

function setuser(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role,
    },
        process.env.JWT_SECRET,
        { expiresIn: "7d" });
}

function getuser(Token) {
    if (!Token || !process.env.JWT_SECRET) return null;

    try {
        return jwt.verify(Token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = {
    setuser,
    getuser


}
