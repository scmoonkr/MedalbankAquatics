const router        = require("express").Router();
const Controller    = require('./users.controller');

// const imageLibrary  = require("../library/images.library.js");
// router.post("/saveWithImage", imageLibrary.upload.single('image'),
//                                 Controller.saveWithImage);

router.patch("/setUser",				Controller.setUser);

//##################################################################
//########################## confirm ###############################
//##################################################################



router.post("/searchNames",			Controller.searchNames);

router.post("/checkEmail",			Controller.checkEmail);

router.post("/checkNickname",		Controller.checkNickname);

router.post("/settings",				Controller.settings);

router.get("/summary/:userID",	Controller.summary);

router.get("/questions/:userID",Controller.questions);

router.post("/updatePublic",		Controller.updatePublic);

router.get("/:userID",					Controller.detail);
router.get("/brief/:userID",		Controller.brief);

router.post("/",								Controller.list);

router.put("/",									Controller.insert);

router.patch("/",								Controller.update);
router.patch("/setPassword",		Controller.setPassword);

router.delete("/update/:userID",Controller.updateDelete);

router.delete("/:userID",				Controller.delete);

router.post("/create",					Controller.create);


module.exports = router;