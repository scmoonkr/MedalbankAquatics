const router = require("express").Router();
const Controller = require('./comments.controller');

router.post("/view",          Controller.view);
router.post("/viewList",      Controller.viewList);

router.post("/",              Controller.list);

router.get("/:commentID",     Controller.detail);

router.put("/",               Controller.insert);
router.put("/old",            Controller.insertOLD);

router.patch("/",             Controller.update);

router.delete("/update/:commentID",  Controller.updateDelete);

router.delete("/:commentID",  Controller.delete);

router.post("/create",        Controller.create);


module.exports = router;