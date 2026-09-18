const router        = require("express").Router();
const Controller    = require('./athletes.controller.js');

const imageLibrary  = require("../library/images.library.js");
// const upload = multer({ storage }).single('image');

router.get("/:athleteID/:discipline",   Controller.AthleteController.detail);


router.post("/view",			Controller.AthleteController.view);

router.post("/",				Controller.AthleteController.list);
router.patch("/",				Controller.AthleteController.update);
router.delete("/:athleteID",    Controller.AthleteController.delete);   

/**
 * Save image to database
 */
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


module.exports = router;