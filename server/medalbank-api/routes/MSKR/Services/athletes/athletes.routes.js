const router        = require("express").Router();
const Controller    = require('./athletes.controller.js');

const imageLibrary  = require("../library/images.library.js");
// const upload = multer({ storage }).single('image');

// search Name
router.post("/names",					  Controller.AthleteController.names);
// router.post("/namesView",					  Controller.AthleteController.list);

router.post("/viewTimes",			      Controller.AthleteController.viewWithTimes);
router.post("/view",			          Controller.AthleteController.view);
// edit시 athlete 가져오기
router.get("/:athleteID",						Controller.AthleteController.detail);

router.post("/saveWithImage",       
  (req, res, next) => {
      console.log("===== athletes.1.Before upload.single middleware =====");
      next();
  },
  imageLibrary.upload.single('image'),
  (req, res, next) => {
      console.log("===== After upload.single, Before saveAthleteWithImage =====");
      console.log("File info:", req.file);
      next();
  },
  Controller.AthleteController.saveAthleteWithImage,
  (req, res, next) => {
      console.log("===== After saveAthleteWithImage completed =====");
      next();
  }
); 

/**
 * Save image to database
 */
router.post("/saveImage",       
  (req, res, next) => {
      console.log("===== athletes.2.Before upload.single middleware =====");
      next();
  },
  imageLibrary.upload.single('image'),
  (req, res, next) => {
      console.log("===== After upload.single, Before saveImage =====");
      console.log("File info:", req.file);
      next();
  },
  Controller.AthleteController.saveAthleteImage,
  (req, res, next) => {
      console.log("===== After saveImage completed =====");
      next();
  }
);    
router.post("/",				Controller.AthleteController.list);
router.post("/listBackend",		Controller.AthleteController.listBackend);

router.patch("/",				Controller.AthleteController.update);

router.delete("/:athleteID",    Controller.AthleteController.delete);                        



//####################################################################
//########## Confirm #################################################
//####################################################################

router.post("/merge",	          		Controller.AthleteController.merge);

router.post("/athletesGroup",				Controller.AthleteController.athletesGroup);

router.post("/athletesCompetition",	Controller.AthleteController.athletesCompetition);

router.post("/importantAthletes",		Controller.AthleteController.importantAthletes);

router.post("/noTimes",							Controller.AthleteController.noTimes);

router.post("/top100Athletes",			Controller.AthleteController.top100Athletes);

router.post("/selectedAthletes",		Controller.AthleteController.selectedAthletes);

router.post("/sameNameGenderTeam",	Controller.AthleteController.sameNameGenderTeam);

router.post("/mergeSameNameGenderTeam",	Controller.AthleteController.mergeSameNameGenderTeam);

router.post("/splitAthletes",				Controller.AthleteController.splitAthletes);

router.post("/saveHomonym",					Controller.AthleteController.saveHomonym);

router.post("/confirmAthletes",			Controller.AthleteController.confirmAthletes);

router.post("/uniqueAthletes",			Controller.AthleteController.uniqueAthletes);

router.post("/insertUniqueAthlete",	Controller.AthleteController.insertUniqueAthlete);

router.post("/removeUniqueAthlete",	Controller.AthleteController.removeUniqueAthlete);

router.post("/unsetTimesAthleteID",	Controller.AthleteController.unsetTimesAthleteID);

router.post("/athleteTimes",				Controller.AthleteController.athleteTimes);

router.post("/deleteAthleteTimes",	Controller.AthleteController.deleteAthleteTimes);

router.post("/medalList",						Controller.AthleteController.medalList);

// router.post("/times",			          (req, res) => {
//   console.log("++++++++++++++++++++++++++++ athletesNew.times");
//   Controller.AthleteController.times(req, res, next);
// });

router.post("/viewMedalbank",			  Controller.AthleteController.viewMedalbank);


router.post("/searchName",					Controller.AthleteController.searchName);

//--------------------------------------------------------
// ??????????????????????

router.put("/",											Controller.AthleteController.insert);

router.post("/delete",	          	Controller.AthleteController.updateDelete);

router.post("/create",							Controller.AthleteController.create);


module.exports = router;