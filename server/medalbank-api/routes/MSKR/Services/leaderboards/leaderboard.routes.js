const router = require("express").Router();
const Controller = require('./leaderboard.controller');


// router.post("/view",					Controller.view);
// router.post("/viewList",			Controller.viewList);

// router.post("/",							Controller.LeaderboardController.list); // times DB realtime 이용
router.post("/",							Controller.LeaderboardController.listRealtime); // times DB realtime 이용
router.post("/listRealtime",	Controller.LeaderboardController.listRealtime); // leaderboard이용
router.post("/capture",			Controller.LeaderboardController.list4Capture); // leaderboard이용	


//######################################################################
//############################ Confirm #################################
//######################################################################

router.post("/listBrief",			Controller.LeaderboardController.listBrief);
router.post("/today",					Controller.LeaderboardController.listToday);
router.post("/listNow",			  Controller.LeaderboardController.listNow);

router.post("/build",					Controller.LeaderboardController.build);

router.post("/deletePermanent",	Controller.LeaderboardController.deletePermanent);
router.post("/restore",	      Controller.LeaderboardController.restore);

router.get("/:LID",	          Controller.LeaderboardController.detail);

router.put("/",							 	Controller.LeaderboardController.insert);

router.patch("/",						 	Controller.LeaderboardController.update);

router.delete("/:LID",			  Controller.LeaderboardController.delete);

router.post("/create",				Controller.LeaderboardController.create);

module.exports = router;