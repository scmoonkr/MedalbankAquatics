const router        = require("express").Router();
const multer        = require('multer');
const path          = require('path');
const Controller    = require('./teams.controller');
const imageLibrary  = require("../library/images.library.js");

// router.post("/saveWithImage", imageLibrary.upload.single('image'),
//                               Controller.TeamController.saveTeamWithImage);
// 라우터에서 에러 핸들링 추가
  router.post("/saveWithImage", (req, res, next) => {
                                  console.log("saveWithImage.11111");
                                  imageLibrary.upload(req, res, (err) => {
                                    console.log("saveWithImage.22222");
                                    if (err) {
                                        console.error("Multer error:", err);
                                        return res.status(500).json({ error: err.message });
                                    }
                                    console.log("saveWithImage.33333");
                                    next();
                                  });
                                },
                                Controller.TeamController.saveTeamWithImage
                              );            

router.post("/view",					Controller.TeamController.view);
router.post("/search",				Controller.TeamController.search);
// router.post("/",							Controller.TeamController.list);
router.post("/",							Controller.TeamController.listRealtime);
router.post("/names",					Controller.TeamController.names);
router.post("/list",					Controller.TeamController.list);
router.post("/merge",					Controller.TeamController.merge);

//####################################################################
//######### Confirm ##################################################
//####################################################################
                              
// router.post("/view",					Controller.view);
// router.post("/viewList",			Controller.viewList);


router.get("/:teamID/:userID",Controller.TeamController.detail);

router.post("/rank",				  Controller.TeamController.rank);

router.put("/",							 	Controller.TeamController.insert);

router.patch("/",						 	Controller.TeamController.update);

router.delete("/update/:teamID",	Controller.TeamController.updateDelete);

router.delete("/:teamID",			Controller.TeamController.delete);

router.post("/create",				Controller.TeamController.create);

router.post("/statistics",		Controller.TeamController.statistics);

router.post("/buildStatistics",		      Controller.TeamController.buildStatistics);

router.post("/setTimesTeamID",				  Controller.TeamController.setTimesTeamID);
router.post("/resetTimesTeamID",				Controller.TeamController.resetTimesTeamID);
router.post("/setAthletesTeamID",				Controller.TeamController.setAthletesTeamID);
router.post("/getTeamTimesNotExists",		Controller.TeamController.getTeamTimesNotExists);
router.post("/getTeamAthletesNotExists",Controller.TeamController.getTeamAthletesNotExists);
router.post("/setTimesTeamIDbyTeam",		Controller.TeamController.setTimesTeamIDbyTeam);
router.post("/summary",				          Controller.TeamController.summary);

module.exports = router;