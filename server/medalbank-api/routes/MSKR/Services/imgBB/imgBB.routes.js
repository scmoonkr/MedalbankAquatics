const router        = require("express").Router();
const Controller    = require('./imgBB.controller.js');

const imageLibrary  = require("../library/images.library.js");
// const upload
router.post("/saveImage",       
  (req, res, next) => {
      console.log("===== imagesBefore upload.single middleware =====");
      next();
  },
  imageLibrary.upload.single('image'),
  (req, res, next) => {
      console.log("===== After upload.single, Before saveImage =====");
      console.log("File info:", req.file);
      next();
  },
  Controller.AthleteController.saveImage,
  (req, res, next) => {
      console.log("===== After saveImage completed =====");
      next();
  }
); 

//####################################################################
//####################################################################
//####################################################################


module.exports = router;