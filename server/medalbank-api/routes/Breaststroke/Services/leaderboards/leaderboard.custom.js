
exports.query = (time) => {
	const query = {};
	if (time.leaderboardID) query.lid = time.leaderboardID;
	if (time.group				) query.gr = time.group;
	if (time.year					) query.yr = time.year;
	if (time.month				) query.mt = time.month;
	if (time.day					) query.dy = time.day;
	if (time.week					) query.wk = time.week;
	if (time.userID				) query.uid= time.userID;
	if (time.competitionID) query.cid= time.competitionID;
	if (time.teamID				) query.tid= time.teamID;
	if (time.poolID				) query.pid= time.poolID;
	if (time.name					) query.nm = time.name;
	if (time.isMasters		) query.ms = time.isMasters;
	if (time.isAdult			) query.ad = time.isAdult;
	if (time.isIndividual	) query.in = time.isIndividual;
	if (time.isOfficial		) query.of = time.isOfficial;
	if (time.gender				) query.gd = time.gender;
	if (time.ageGroup			) query.ag = time.ageGroup;
	if (time.discipline				) query.st = time.discipline;
	if (time.course				) query.cs = time.course;
	if (time.distance			) query.ds = time.distance;
	if (time.time					) query.ti = time.time;
	if (time.timestamp		) query.ts = time.timestamp;
	if (time.rank					) query.rk = time.rank;
	if (time.rankGroup		) query.rg = time.rankGroup;
	if (time.team					) query.tm = time.team;
	if (time.datetime			) query.dt = time.datetime;

	return query;
}

exports.encode = (time) => {
	const value = {};
	if (time.leaderboardID) value.lid= time.leaderboardID;
	if (time.group				) value.gr = time.group;
	if (time.year					) value.yr = time.year;
	if (time.month				) value.mt = time.month;
	if (time.day					) value.dy = time.day;
	if (time.week					) value.wk = time.week;
	if (time.userID				) value.uid= time.userID;
	if (time.competitionID) value.cid= time.competitionID;
	if (time.teamID				) value.tid= time.teamID;
	if (time.poolID				) value.pid= time.poolID;
	if (time.name					) value.nm = time.name;
	if (time.isMasters		) value.ms = time.isMasters;
	if (time.isAdult			) value.ad = time.isAdult;
	if (time.isIndividual	) value.in = time.isIndividual;
	if (time.isOfficial		) value.of = time.isOfficial;
	if (time.gender				) value.gd = time.gender;
	if (time.ageGroup			) value.ag = time.ageGroup;
	if (time.discipline				) value.st = time.discipline;
	if (time.course				) value.cs = time.course;
	if (time.distance			) value.ds = time.distance;
	if (time.time					) value.ti = time.time;
	if (time.timestamp		) value.ts = time.timestamp;
	if (time.rank					) value.rk = time.rank;
	if (time.rankGroup		) value.rg = time.rankGroup;
	if (time.datetime			) value.dt = time.datetime;

	return value;
}


exports.decode = (data) => {
	const value = {};
	if (time.lid) value.leaderboardID = data.lid;
	if (time.gr ) value.group 				= data.gr;
	if (time.yr ) value.year 					= data.yr;
	if (time.mt ) value.month 				= data.mt;
	if (time.dy ) value.day 					= data.dy;
	if (time.wk ) value.week 					= data.wk;
	if (time.uid) value.userID 				= data.uid;
	if (time.cid) value.competitionID = data.cid;
	if (time.tid) value.teamID 				= data.tid;
	if (time.pid) value.poolID 				= data.pid;
	if (time.nm ) value.name 					= data.nm;
	if (time.ms ) value.isMasters 		= data.ms;
	if (time.ad ) value.isAdult 			= data.ad;
	if (time.in ) value.isIndividual	= data.in;
	if (time.of ) value.isOfficial 		= data.of;
	if (time.gd ) value.gender 				= data.gd;
	if (time.ag ) value.ageGroup 			= data.ag;
	if (time.st ) value.discipline 				= data.st;
	if (time.cs ) value.course 				= data.cs;
	if (time.ds ) value.distance 			= data.ds;
	if (time.ti ) value.time 					= data.ti;
	if (time.ts ) value.timestamp 		= data.ts;
	if (time.rk ) value.rank 					= data.rk;
	if (time.rg ) value.rankGroup 		= data.rg;
	if (time.tm ) value.team 					= data.tm;
	if (time.dt ) value.datetime 			= data.dt;

	return value;
}

exports.encodeAll = (time) => {
	const value = {
		lid : time.leaderboardID,
		gr : time.group,
		yr : time.year,
		mt : time.month,
		dy : time.day,
		wk : time.week,
		uid: time.userID,
		cid: time.competitionID,
		tid: time.teamID,
		pid: time.poolID,
		nm : time.name,
		ms : time.isMasters,
		ad : time.isAdult,
		in : time.isIndividual,
		of : time.isOfficial,
		gd : time.gender,
		ag : time.ageGroup,
		st : time.discipline,
		cs : time.course,
		ds : time.distance,
		ti : time.time,
		ts : time.timestamp,
		rk : time.rank,
		rg : time.rankGroup,
		dt : time.datetime,
	}		

	return value;
}

exports.decodeAll = (time) => {
	const value = {
		leaderboardID	: time.lid,
		group					: time.gr,
		year					: time.yr,
		month					: time.mt,
		day						: time.dy,
		week					: time.wk,
		userID				: time.uid,
		competitionID	: time.cid,
		teamID				: time.tid,
		poolID				: time.pid,
		name					: time.nm,
		isMasters			: time.ms,
		isAdult				: time.ad,
		isIndividual	: time.in,
		isOfficial		: time.of,
		gender				: time.gd,
		ageGroup			: time.ag,
		discipline					: time.st,
		course				: time.cs,
		distance			: time.ds,
		time					: time.ti,
		timestamp			: time.ts,
		rank					: time.rk,
		rankGroup			: time.rg,
		datetime			: time.dt,
	}

	return value;
}
