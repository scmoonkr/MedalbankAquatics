const router        = require("express").Router();
const Controller    = require('./stems.controller');

router.get("/:stemID",				Controller.StemController.detail);
// router.post("/",							Controller.StemController.list);
router.post("/",       
	(req, res, next) => {
			console.log("===== stems.2.Before  =====", req.body);
			next();
	},
	Controller.StemController.list,
); 

router.patch("/",						 	Controller.StemController.update);
router.delete("/:stemID",			Controller.StemController.delete);

router.post("/create",				Controller.StemController.create);

//####################################################################
//######### Confirm ##################################################
//####################################################################


module.exports = router;