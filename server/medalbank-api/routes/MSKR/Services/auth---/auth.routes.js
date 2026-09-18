const router        = require("express").Router();
const {AuthController}    = require('./auth.controller.js');

router.post("/signin",						AuthController.login);
router.post("/signgout",					AuthController.logout);
router.post("/signup",					AuthController.signup);
router.post("/findPassword",  	AuthController.findPassword);
router.post("/changePassword",  AuthController.changePassword);
router.post("/resetPassword",   AuthController.resetPassword);
router.post("/refreshToken",  	AuthController.refreshToken);
router.post("/me",							AuthController.me);


module.exports = router;