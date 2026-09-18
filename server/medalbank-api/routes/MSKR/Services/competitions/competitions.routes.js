const router        = require("express").Router();
const Controller    = require('./competitions.controller');
const imageLibrary  = require("../library/images.library.js");

// router.post("/saveWithImage", imageLibrary.upload.single('image'),
//                                 Controller.CompetitionController.saveWithImage);

router.post("/",									Controller.CompetitionController.list);
router.post("/view",							Controller.CompetitionController.viewNew);

// edit시 competition 조회
router.get("/:competitionID/:userID",			Controller.CompetitionController.detail);
router.post("/brief",			        Controller.CompetitionController.brief);  

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
                                Controller.CompetitionController.saveWithImage
                              );            
router.post("/searchNames",				Controller.CompetitionController.searchNames);  
router.post("/stemNames",				Controller.CompetitionController.stemNames);
router.post("/saveStem",				Controller.CompetitionController.saveStem);
router.put("/",							 			Controller.CompetitionController.insert);
router.patch("/",						 			Controller.CompetitionController.update);



//####################################################################
//######### Confirm ##################################################
//####################################################################

router.post("/upcomings",				  Controller.CompetitionController.upcomings);
router.post("/names",							Controller.CompetitionController.names);
router.post("/monthGroup",				Controller.CompetitionController.monthGroup);
router.get("/ageGroup/:competitionID",  Controller.CompetitionController.ageGroup);
// router.post("/ageGroup",					Controller.CompetitionController.ageGroup);
router.post("/upcomming",					Controller.CompetitionController.upcomming);
router.post("/medals",						Controller.CompetitionController.medals);
router.post("/times",							Controller.CompetitionController.times);
router.post("/years",							Controller.CompetitionController.years);
router.post("/backendList",				Controller.CompetitionController.backendList);

router.post("/getMedals",					Controller.CompetitionController.getMedals);

router.post("/competitionTimes",	Controller.CompetitionController.competitionTimes);
router.post("/disciplineTimes",		Controller.CompetitionController.disciplineTimes);





router.delete("/update/:competitionID",	Controller.CompetitionController.updateDelete);

router.delete("/:competitionID",	Controller.CompetitionController.delete);

router.post("/create",						Controller.CompetitionController.create);


module.exports = router;