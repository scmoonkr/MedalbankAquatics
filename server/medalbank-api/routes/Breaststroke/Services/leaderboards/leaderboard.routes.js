const router = require("express").Router();
const Controller = require('./leaderboard.controller');


// router.post("/view",					Controller.view);
// router.post("/viewList",			Controller.viewList);

// router.post("/",							Controller.LeaderboardController.list); // times DB realtime 이용
router.post("/",							Controller.LeaderboardController.listRealtime); // times DB realtime 이용
router.post("/listRealtime",	Controller.LeaderboardController.listRealtime); // leaderboard이용


//######################################################################
//############################ Confirm #################################
//######################################################################

module.exports = router;