const router = require("express").Router();
const Controller = require('./tags.controller');

router.post("/",					Controller.list);

router.put("/",						Controller.insert);
router.delete("/:tagID",	Controller.delete);

router.post("/create",		Controller.create);


module.exports = router;