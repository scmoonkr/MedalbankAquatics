const utilLibrary = require("../../Util/utilLibrary");
const mskCFG 		  = require('../../Config/mskCFG');
const UtilDate    = require("../../Util/utilDate");
const utilDate	  = new UtilDate();

exports.encodeValue = (time) => {
  const value = {
    lid: time.leaderboardID || 0,
    uid: time.userID,
    cid: time.competitionID,
    tid: time.timeID,
    pid: time.poolID,
    nm : time.name,
    ms : time.masters,
    ad : time.adult,
    in : time.individual,
    of : time.isOfficial || false,
    gd : mskCFG.genders.indexOf(time.gender),
    ag : time.ageGroup,
    st : mskCFG.styles.indexOf(time.style),
    cs : mskCFG.courses.indexOf(time.course),
    ds : mskCFG.distances.indexOf(time.distance),
    // ti : time.times,
    ts : time.timestamp,
    df : time.diffs || "",
    rk : time.rank,
    tm : time.team,        
  }
  return value;
}

exports.encodeValueNull = (time) => {
  const value = {};
  if (time.leaderboardID) value.lid = Number(time.leaderboardID);
  if (time.userID) value.uid = Number(time.userID);
  if (time.competitionID) value.cid = Number(time.competitionID);
  if (time.teamID) value.tid = Number(time.teamID);
  if (time.poolID) value.pid = Number(time.poolID);
  if (time.name) value.nm = time.name;
  if (time.isMasters) value.ms = time.isMasters;
  if (time.isAdult) value.ad = time.isAdult;
  if (time.isIndividual) value.in = time.isIndividual;
  if (time.isOfficial) value.of = time.isOfficial;
  if (time.gender) value.gd = time.gender;
  if (time.ageGroup) value.ag = Number(time.ageGroup);
  if (time.style) value.st = time.style;
  if (time.course) value.cs = time.course;
  if (time.distance) value.ds = time.distance;
  if (time.time) value.ts = time.time;
  if (time.times) value.ti = time.times;
  if (time.timestamp) value.ts = Number(time.timestamp);
  if (time.diffs) value.df = time.diffs;
  if (time.rank) value.rk = Number(time.rank);
  if (time.team) value.tm = time.team;

  return value;
}

exports.decodeValue = (time) => {
  const value = {
    leaderboardID: Number(time.lid),
    userID: Number(time.uid),
    competitionID: Number(time.cid),
    teamID: Number(time.tid),
    poolID: Number(time.pid),
    name: time.nm,
    isMasters: time.ms,
    isAdult: time.ad,
    isIndividual: time.in,
    isOfficial: time.of,
    gender: mskCFG.genders[time.gd],
    ageGroup: time.ag,
    style: mskCFG.styles[time.st],
    course: mskCFG.courses[time.cs],
    distance: mskCFG.distances[time.ds],
    time: utilDate.convertTimestamp2string(time.ts),
    timestamp: Number(time.ts),
    diffs: time.df,
    rank: Number(time.rk),
    team: time.tm,    
  };
  // if (time.lid) value.leaderboardID = Number(time.lid);
  // if (time.uid) value.userID = Number(time.uid);
  // if (time.cid) value.competitionID = Number(time.cid);
  // if (time.tid) value.teamID = Number(time.tid);
  // if (time.pid) value.poolID = Number(time.pid);
  // if (time.nm) value.name = time.nm;
  // if (time.ms) value.isMasters = time.ms;
  // if (time.ad) value.isAdult = time.ad;
  // if (time.in) value.isIndividual = time.in;
  // if (time.of) value.isOfficial = time.of;
  // if (time.gd) value.gender = mskCFG.genders[time.gd];
  // if (time.ag) value.ageGroup = time.ag;
  // if (time.st) value.style = mskCFG.styles[time.st];
  // if (time.cs) value.course = mskCFG.courses[time.cs];
  // if (time.ds) value.distance = mskCFG.distances[time.ds];
  // if (time.ti) value.time = time.ti;
  // if (time.ts) value.timestamp = Number(time.ts);
  // if (time.df) value.diffs = time.df;
  // if (time.rk) value.rank = Number(time.rk);
  // if (time.tm) value.team = time.tm;
  
  return value;
}
exports.field = (data) => {
	const value = {
    seqno	    		: data.seqno	   	|| 0,
    timeID    		: data.timeID   	|| 0,
    athleteID 		: data.athleteID	|| 0,
    teamID    		: data.teamID   	|| 0,
    name      		: data.name     	|| "",
    nameHide			: data.conscent ? data.name : data.nameHide,
    teamName			: data.teamName		|| "",
    team      		: data.team     	|| "",
    rank      		: data.rank     	|| 0,
    times     		: data.times    	|| "",
    masters   		: data.masters		== false ? false : true,
    adult   			: data.adult   		== false ? false : true,
    individual		: data.individual	== false ? false : true,
    ageGroup  		: data.ageGroup 	|| "",
    gender    		: data.gender   	|| "",
    style     		: data.style    	|| "",
    course    		: data.course   	|| "",
    distance  		: data.distance 	|| "",
    competitionID	: data.competitionID  == undefined ? 0 : Number(data.competitionID),
  }
  value.nameHide 						= utilLibrary.nameHide(data.name);

  if (data.timeID)					value.timeID 					= Number(data.timeID);
  if (data.teamID)					value.teamID 					= Number(data.teamID);
  if (data.athleteID)				value.athleteID 			= Number(data.athleteID);
  if (data.groupRank)				value.groupRank				= Number(data.groupRank);

  if (data.status)					value.status 					= data.status;
  if (data.datetime)				value.datetime				= new Date(data.datetime).toISOString().slice(0, 10);
  // if (data.name)						value.nameHide				= utilLibrary.nameHide(data.name);
  if (data.names)						value.names 					= typeof data.names == "string" ? data.names.split(',') : data.names;
  if (data.nameEng)					value.nameEng					= data.nameEng;
  if (data.namesEng)				value.namesEng				= typeof data.namesEng == "string" ? data.namesEng.split(',') : data.namesEng;
  // if (value.names.length == 0) value.names = value.name.split(',');
  if (data.age)							value.age 						= data.age.toString();
  if (data.birth)						value.birth 					= data.birth;
  if (data.round)						value.round 					= data.round;
  if (data.time)						value.time 						= data.time;
  if (data.heat)						value.heat 						= data.heat.toString();
  if (data.heatCode)				value.heatCode 				= data.heatCode;
  if (data.diffs)						value.diffs						= data.diffs;
  if (data.rankGroup)				value.rankGroup				= Number(data.rankGroup);
  if (data.lane)						value.lane 						= data.lane.toString();
  if (data.sido)						value.sido 						= data.sido;
  if (data.pool)						value.pool 						= data.pool;
  if (data.poolID)					value.poolID 					= Number(data.poolID);
  if (data.stemID)					value.stemID 					= Number(data.stemID);
  if (data.competitionName)	value.competitionName	= data.competitionName;
  if (data.fin)							value.fin 						= data.fin;
  if (data.top)							value.top 						= data.top;
  if (data.bestRank)				value.bestRank 				= data.bestRank;
  if (data.timeORG)				value.timeORG 				= data.timeORG;
  if (data.note)						value.note 						= data.note;
  if (! data.year && data.datetime)	 value.year 	= new Date(data.datetime).getFullYear();

  if (value.times.length > 10) {
    value.times = value.times.indexOf("00:") == 0 ? value.times.slice(3) : value.times;
  }

  if (value.style.includes('Relay') && value.team != "") {
    value.name = value.team;
    value.nameHide = value.team;
  }
  return value;
}
