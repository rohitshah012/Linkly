const { getuser } = require("../service/auth");

function CheckForAuthentication(req, res, next) {
    const TokenCookie = req.cookies?.uid;

    req.user = null;

    if (!TokenCookie) return next()


    const Token = TokenCookie;

    const user = getuser(Token);

    req.user = user;

    return next()

}

function restrictTo(role = []) {
    return function (req, res, next) {
        if (!req.user) return res.redirect("/login")

        if (!role.includes(req.user.role)) return res.end("UnAuthorized")

        return next();
    }
}
// async function RestrictToLoginUserOnly(req, res, next) {

//     const userUid = req.cookies?.uid;

//     if (!userUid) return res.redirect("/login");

//     const user = getuser(userUid)

//     if (!user) return res.redirect('/login')

//     req.user = user;

//     next();
// }
// async function CheckAuth(req, res, next) {
//       const userUid = req.cookies?.uid;
//     const user = getuser(userUid)
//     req.user = user;
//     next();
// }



module.exports = {
    CheckForAuthentication,
    restrictTo,

}