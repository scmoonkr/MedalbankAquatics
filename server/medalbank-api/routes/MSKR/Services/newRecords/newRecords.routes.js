const router        = require("express").Router();
const Controller    = require('./newRecords.controller.js');

router.post("/",							Controller.NewRecordsController.list);
router.put("/",							 	Controller.NewRecordsController.insert);

router.patch("/",						 	Controller.NewRecordsController.update);

router.post("/create",				Controller.NewRecordsController.create);

//####################################################################
//######### Confirm ##################################################
//####################################################################


module.exports = router;