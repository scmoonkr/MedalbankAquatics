const router = require("express").Router();
const Controller = require('./times.controller');
const imageLibrary = require("../library/images.library.js");

// router.post("/",							(req, res, next) => {
//           console.log("===== times.Before list =====");
//           next();
//         },
//         Controller.list,
//         (req, res, next) => {
//           console.log("===== After times.list =====");
//           next();
//         }
//       );
router.post("/",							Controller.list);
router.post("/timelists",			Controller.searchNames);
router.post("/notMyTime",			Controller.notMyTime);
router.post("/searchNames",			Controller.searchNames);
router.post("/searchNameStyle",			Controller.searchNameStyle);
router.get("/view/:timeID/:userID", Controller.view);



//####################################################################
//######### Confirm ##################################################
//####################################################################

// router.post("/saveTimeWithImage", imageLibrary.upload.single('image'),
//                                 Controller.saveTimeWithImage);
// 라우터에서 에러 핸들링 추가
  //--------------------------------------    
  router.post("/saveTimeWithImageURL",			Controller.saveTimeWithImageURL);
  router.post("/saveTimeWithImage", (req, res, next) => {
                                    console.log("===== times.Before upload.single middleware =====");
                                    next();
                                },
                                imageLibrary.upload.single('image'),
                                (req, res, next) => {
                                    console.log("===== After upload.single, Before saveTimeWithImage =====");
                                    console.log("File info:", req.file);
                                    next();
                                },
                                Controller.saveTimeWithImage,
                                (req, res, next) => {
                                    console.log("===== After saveTimeWithImage completed =====");
                                    next();
                                }
                              );                            
  router.post("/insert",			Controller.insertTimeResultMSKR);

  router.post("/saveTimeResult", Controller.saveTimeResultNew); // times/edit
//  router.post("/saveTimeResult", (req, res, next) => {
//                                     console.log("===== saveTimeResult =====", req.body);
//                                     next();
//                                 },
//                                 Controller.saveTimeResultNew,
//                                 (req, res, next) => {
//                                     console.log("===== After saveTimeWithImage completed =====");
//                                     next();
//                                 }
//                               );


// router.post("/insert",        imageLibrary.upload.single('image'),
//                               Controller.saveTimeWithImage);

router.get("/:timeID/:athleteID", Controller.detail);
router.post("/searchNames",		Controller.searchNames);
router.delete("/:timeID",			Controller.delete);
router.delete("/update/:timeID",			Controller.deleteUpdate);
router.delete("/MSKR/:timeID",			Controller.deleteMSKR);
// router.patch("/times",				Controller.updateTimes);
router.patch("/times",				Controller.updateTimesMSKR);

//####################################################################
//######### Confirm ##################################################
//####################################################################
// router.post("/view",					Controller.view);
// router.post("/viewList",			Controller.viewList);



router.put("/",							 	Controller.insert);

router.patch("/",						 	Controller.update);

router.delete("/update/:timeID",	Controller.updateDelete);


router.post("/create",				Controller.create);

router.post("/heatsheets",		Controller.heatsheets);
// router.post("/saveTimeResult",Controller.saveTimeResult);

router.post("/searchNamesStyles",				Controller.searchNamesStyles);
router.post("/latests",				Controller.latests);
router.post("/top1",					Controller.top1);
router.post("/top8",					Controller.top8);
router.post("/top100",				Controller.top100);
router.post("/backendList",		Controller.backendList);
router.post("/medalists",			Controller.medalists);
router.post("/records",				Controller.records);

router.post("/searchRanking",	Controller.searchRanking);
router.post("/updateTimesAthleteID",	Controller.updateTimesAthleteID);
router.post("/removeTimesAthleteID",	Controller.removeTimesAthleteID);

module.exports = router;