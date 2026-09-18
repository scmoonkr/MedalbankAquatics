const router        = require("express").Router();
const Controller    = require('./magazine.controller.js');
const imageLibrary  = require("../library/images.library.js");

router.get("/downloadRanking",	Controller.MagazineController.downloadRanking);
router.get("/:magazineID",			Controller.MagazineController.detail);
router.post("/",								Controller.MagazineController.list);
router.put("/",							 		Controller.MagazineController.insert);

router.patch("/",						 		Controller.MagazineController.update);
router.delete("/:magazineID",		Controller.MagazineController.delete);

router.post("/create",					Controller.MagazineController.create);

//####################################################################
//######### Confirm ##################################################
//####################################################################


module.exports = router;