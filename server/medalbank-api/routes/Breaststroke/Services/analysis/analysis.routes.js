const router        = require("express").Router();
const Controller    = require('./analysis.controller.js');

const imageLibrary  = require("../library/images.library.js");
// const upload = multer({ storage }).single('image');

router.get("/:analysisID/:discipline",   Controller.AnalysisController.detail);


router.post("/view",			Controller.AnalysisController.view);

router.post("/",				Controller.AnalysisController.list);
router.patch("/",				Controller.AnalysisController.update);
router.delete("/:analysisID",    Controller.AnalysisController.delete);   

/**
 * Save image to database
 */
router.post("/saveWithImage",       
  (req, res, next) => {
      console.log("===== analysis.1.Before upload.single middleware =====");
      next();
  },
  imageLibrary.upload.single('image'),
  (req, res, next) => {
      console.log("===== After upload.single, Before saveAnalysisWithImage =====");
      console.log("File info:", req.file);
      next();
  },
  Controller.AnalysisController.saveAnalysisWithImage,
  (req, res, next) => {
      console.log("===== After saveAnalysisWithImage completed =====");
      next();
  }
); 


module.exports = router;