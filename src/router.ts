const router = require("express").Router();
const userController = require("./controllers/userController")



router.post("/login", userController.apiLogin);
router.post("/register", userController.apiRegister);


export default router;