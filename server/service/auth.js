const jwt = require("jsonwebtoken");
const secret = "RavanRohit";


function setuser(user) {

    return jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role,
    },
        secret);
}

function getuser(Token) {
    if (!Token) return null
   
    try {
         return jwt.verify(Token, secret)
        
    } catch (error) {
        return null
        
    }


}

module.exports = {
    setuser,
    getuser


}
