const router = require("express").Router();
const Controller = require('./names.controller');

router.get("/:type/:name",  	Controller.detail);

router.post("/",							Controller.list);
router.post("/getNames",		  Controller.getNames);
router.post("/check",					Controller.check);
router.post("/delete",	      Controller.delete);

router.put("/",								Controller.insert);

router.patch("/",							Controller.update);

router.post("/create",				Controller.create);


module.exports = router;