const router = require("express").Router();
const Controller = require('./statistics.controller');


router.post("/main",				Controller.StaticController.main);
router.post("/mainNew",					  Controller.StaticController.mainNew);

//####################################################################
//########## Confirm #################################################
//####################################################################

router.post("/rankings",				Controller.StaticController.rankings);

router.post("/clear",		        Controller.StaticController.clearMemory);
router.post("/load",		        Controller.StaticController.loadMemory);

router.post("/getStatistics",		Controller.StaticController.getStatistics);
router.post("/getAthletes",			Controller.StaticController.getAthletesMemory);
router.post("/getTimes",	      Controller.StaticController.getTimesMemory);
router.post("/getTeams",	      Controller.StaticController.getTeamsMemory);
router.post("/getPools",	      Controller.StaticController.getPoolsMemory);
router.post("/getCompetitions",	Controller.StaticController.getCompetitionsMemory);
router.post("/getMeasuredRecent",	Controller.StaticController.getMeasuredRecent);
router.post("/getMeasuredMost",	Controller.StaticController.getMeasuredMost);
router.post("/getSearchCount",	Controller.StaticController.getSearchCount);
router.post("/getSearchRecent",	Controller.StaticController.getSearchRecent);

router.post("/getJoined",			  Controller.StaticController.getJoined);

module.exports = router;