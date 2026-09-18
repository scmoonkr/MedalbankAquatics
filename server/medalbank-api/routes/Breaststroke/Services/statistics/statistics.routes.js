const router = require("express").Router();
const Controller = require('./statistics.controller');


router.post("/", 											Controller.StatisticsController.statistics);
router.get("/buildStatistics/:date", 	Controller.StatisticsController.buildStatistics);
router.get("/hallOfFame/:discipline", Controller.StatisticsController.hallOfFame);

//####################################################################
//########## Confirm #################################################
//####################################################################


module.exports = router;