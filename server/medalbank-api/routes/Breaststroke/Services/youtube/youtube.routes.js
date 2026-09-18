const router        = require("express").Router();
const Controller    = require('./youtube.controller');
const imageLibrary  = require("../library/images.library.js");

router.get("/:youtubeID",				Controller.YoutubeController.detail);
router.post("/",							Controller.YoutubeController.list);
router.put("/",							 	Controller.YoutubeController.insert);

router.patch("/",						 	Controller.YoutubeController.update);
router.delete("/:youtubeID",			Controller.YoutubeController.delete);

router.post("/create",				Controller.YoutubeController.create);

//####################################################################
//######### Confirm ##################################################
//####################################################################


module.exports = router;