var express 		= require('express');
var router 			= express.Router();
const indexDAO	= require("./indexDAO");
const timesDAO	= require("./timesDAO");
const backupDAO	= require("./backupDAO");

const staticsDAO			= require("../importTimes/staticsDAO");
const rankingsDAO			= require("../importTimes/rankingsDAO");
const athleteDAO	    = require('../athletes/athletes.model');



//----------------------------------------
//	backup
//----------------------------------------
router.post('/backupDelete', async (req, res, next) => {
  console.log("backupDelete.body=", req.body);
  try {
    //------------------------------------
    const result = await backupDAO.backupDelete(req.body );
    //------------------------------------
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e); 
  }
})
router.post('/backup', async (req, res, next) => {
  try {
    //------------------------------------
    const result = await backupDAO.backup(req.body );
    //------------------------------------
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e); 
  }
})
/*
 *	build statics
 *
 */
router.post('/statisticsAll', async function(req, res, next) {
  try {
    let result = await staticsDAO.statisticsAll(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})
router.post('/staticAthletes', async function(req, res, next) {
  try {
    let result = await staticsDAO.staticAthletes(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})
router.post('/staticRankings', async function(req, res, next) {
  try {
    let result = await staticsDAO.staticRankings(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})
router.post('/staticTeams', async function(req, res, next) {
  try {
    let result = await staticsDAO.staticTeams(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})
router.post('/staticPools', async function(req, res, next) {
  try {
    let result = await staticsDAO.staticPools(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})
router.post('/staticCompetitions', async function(req, res, next) {
  try {
    let result = await staticsDAO.staticCompetitions(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})
router.post('/staticStems', async function(req, res, next) {
  try {
    let result = await staticsDAO.staticStems(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})

//-----------------------------------------------
//  times ranking for competitionID
//-----------------------------------------------
router.post('/statics', async function(req, res, next) {
  try {
    let result = await indexDAO.statics(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})
/*
 *	merge athletes
 * heatID exists -> update else insert
 */
 router.post('/timesRankings', async function(req, res, next) {
  try {
    let result = await timesDAO.timesRankings(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})

//-----------------------------------------------
//  athletes에 athleteID가 없는 times athleteID unset
//-----------------------------------------------
router.post('/unsetTimesAthleteID', async function(req, res, next) {
  try {
    let result = await timesDAO.unsetTimesAthleteID(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})

//-----------------------------------------------
//  remove times 없는 athlete
//-----------------------------------------------
router.post('/deleteAthletesNoTimes', async function(req, res, next) {
  try {
    let result = await timesDAO.deleteAthletesNoTimes(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})

//-----------------------------------------------
//  teams에 teamID가 없는 times teamID가 unset
//-----------------------------------------------
router.post('/unsetTimesTeamID', async function(req, res, next) {
  try {
    let result = await timesDAO.unsetTimesTeamID(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})

//-----------------------------------------------
//  delete name이 없는 athletes
//-----------------------------------------------
router.post('/deleteAthletesNoName', async function(req, res, next) {
  try {
    let result = await timesDAO.deleteAthletesNoName(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})

//-----------------------------------------------
//  delete times not exists athleteID
//-----------------------------------------------
router.post('/deleteTimesNotExistsAthleteID', async function(req, res, next) {
  try {
    let result = await athleteDAO.removeAthletesNoTimes(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})

//-----------------------------------------------
//  rebuild times teamID
//-----------------------------------------------
router.post('/rebuildTimesTeamID', async function(req, res, next) {
  try {
    let result = await timesDAO.rebuildTimesTeamID(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})

//-----------------------------------------------
//  delete teams times not exists
//-----------------------------------------------
router.post('/deleteTeamsTimesNotExists', async function(req, res, next) {
  try {
    let result = await timesDAO.deleteTeamsTimesNotExists(req.body );
    res.header = result;
    res.status(200).send(result);	
  } catch (e){
    console.log(e);
    res.status(503).send(e);  
  }
})

module.exports = router;
