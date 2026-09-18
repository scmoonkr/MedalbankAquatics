const fs          = require('fs');
const extend 			= require('node.extend');
const moment    	= require('moment');
const timezone		= require('moment-timezone');
const momentBD  	= require('moment-business-days');
const holidayKR 	= require('holiday-kr');


const mongoDB			= require('./MongoDB');
const UtilDate    = require("./DateLibrary");
const utilLibrary = require("../Util/utilLibrary");
const {customTimes} = require("../Util/utilTimes");
const swimmingLibrary = require('../Util/swimmingLibrary');

const {swimmingCFG} = require('../Config/swimmingCFG');
const mongoCFG 		= require('../Config/mongoCFG');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const utilDate	  = new UtilDate();

'use strict';
let _leaderbpardOBJ = {};

class RealtimeLeaderboard {
	constructor()  {
		this._historyOBJ = _historyOBJ;
		this._competitions = _competitions;
		if (_competitions.length == 0) {
			// this.initialize();
		}
	}
	//-----------------------------
	// getter
	//-----------------------------
	get leaderboard() 		{ return _leaderbpardOBJ; }

	//-----------------------------
	// 
	//-----------------------------
	getLeaderboard (gender, style, distance, limit=8) {
		const discipline = `${gender}-${style}-${distance}`;

		const leaderboard = _leaderbpardOBJ[discipline].sort((a, b) => a.timeStamp - b.timeStamp)
																									 .slice(0, limit+10); // 같은 등수 때문에 limit+10

		return time;
	}
	getLeaderboardAgeGroup (gender, style, distance, ageGroup, limit=8) {
		const discipline = `${gender}-${style}-${distance}`;

		return time;
	}

}

module.exports = RealtimeLeaderboard;
