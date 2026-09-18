const router = require("express").Router();
const Controller = require('./login.controller');

router.post("/signin",             Controller.login);

router.post("/changePassword",    Controller.changePassword);

router.post("/signout",            Controller.logout);

router.put("/signup",             Controller.signup);

router.post("/setPasswordByRegistrationNo",       Controller.setPasswordByRegistrationNo);


//####################################################################
//######### Confirm ##################################################
//####################################################################


router.post("/jwtPrivateKey",     Controller.jwtPrivateKey);

router.post("/resetPassword",     Controller.resetPassword);

router.post("/lostPasswordEmail",	Controller.lostPasswordEmail);

router.post("/checkEmail",        Controller.checkEmail);

router.post("/checkUserID",       Controller.checkUserID);

router.post("/checkNickname",     Controller.checkNickname);

//사용자 email로 보낸 jwt id를 click했을 경우 jwt collection에서 token을 read
//비밀번호 변경화면의 data-userInfo에 token을 assign후 render 
// --> post:'/loginLostPasswordChange'에서 비밀번호 변경 처리
router.get("/loginLostPassword/:jwtID",     Controller.loginLostPassword);

// 사용자 정보를 json web tocken으로 만들어 사용자 email로 보냄
//사용자 정보를 json web tocken으로 만들어 사용자 email로 보냄
//사용자 email로 보낸 jwt id를 click --> get:/loginLostPassword/:jwtID
router.post("/loginLostPassword",     Controller.loginLostPassword);

//email에서 token id click 
//--> 비밀번호 변경 화면(/views/login/loginLostPasswordChange.ejs) 에서 확인 click
//post 처리
router.post("/lostPasswordChange",     Controller.lostPasswordChange);

module.exports = router;