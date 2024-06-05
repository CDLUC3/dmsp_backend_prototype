const router = require("express").Router();
const { expressjwt } = require('express-jwt');
const userController = require("./controllers/userController")

const secret = process.env.JWTSECRET;

const authMiddleware = expressjwt({
    algorithms: ['HS256'],
    credentialsRequired: false,
    secret,
});



router.post("/login", userController.apiLogin);
router.post("/register", userController.apiRegister);
router.post("/protected", authMiddleware, (req, res) => {
    if (!req.auth.admin) {
        return res.sendStatus(401);
        res.sendStatus(200);
    }
});


export default router;