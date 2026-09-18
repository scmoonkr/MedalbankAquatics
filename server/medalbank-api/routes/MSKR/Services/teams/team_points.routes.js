const router = require("express").Router();
const Controller = require('../../Controllers/Ranking/team_points.controller');

router.get("/:competitionID",   Controller.TeamPointsController.list);
router.post("/listTotal",       Controller.TeamPointsController.listTotal);
router.post("/listTotalNew",    Controller.TeamPointsController.listTotalNew);
router.get("/team/:teamID",     Controller.TeamPointsController.listTeam);
router.post("/teamLeader",      Controller.TeamPointsController.listTeamWSwimmers);
router.post("/teamWork",        Controller.TeamPointsController.listTeamWork);

router.post("/build",			      Controller.TeamPointsController.build);
router.post("/buildPoints",			Controller.TeamPointsController.buildPoints);
router.post("/buildStatics",		Controller.TeamPointsController.buildStatics);
router.post("/buildAll",			  Controller.TeamPointsController.buildAll);
router.delete("/:competitionID",Controller.TeamPointsController.delete);
router.delete("/all",           Controller.TeamPointsController.deleteAll);

router.post("/loadConfig",		  Controller.TeamPointsController.loadConfig);
router.post("/saveConfig",		  Controller.TeamPointsController.saveConfig);

router.post("/create",				  Controller.TeamPointsController.create);

module.exports = router;