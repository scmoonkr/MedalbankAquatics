const router        = require("express").Router();
const Controller    = require('./simulation.controller.js');

// router.post("/saveWithImage", imageLibrary.upload.single('image'),
//                                 Controller.SimulationController.saveItemWithImage);
// 라우터에서 에러 핸들링 추가
router.post("/",				          Controller.SimulationController.competitions);
router.get("/:competitionID",			Controller.SimulationController.list);
router.patch("/:competitionID",		Controller.SimulationController.build);
router.delete("/:competitionID",	  Controller.SimulationController.delete);

router.post("/create",				    Controller.SimulationController.create);

//####################################################################
//######### Confirm ##################################################
//####################################################################


module.exports = router;