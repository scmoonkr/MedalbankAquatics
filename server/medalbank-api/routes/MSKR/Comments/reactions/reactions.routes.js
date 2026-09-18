const router = require("express").Router();
const Controller = require('./reactions.controller');

// router.post("/summary",       Controller.summary);

// router.post("/",              Controller.list);

// router.get("/:reactionID",     	Controller.detail);

// router.put("/",               Controller.insert);

router.patch("/",             Controller.update);

// router.delete("/:reactionID",  	Controller.delete);

// router.post("/create",        Controller.create);


module.exports = router;