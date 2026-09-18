exports.TransactionCategory = {
	//---------------------------------------,
	//	login
	//---------------------------------------,
	login: {
		detail:			{ trcode: 1000,	authority: '',	func: 'detail'		 },	// login-----
		insert:			{ trcode: 1002,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 1004,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 1006,	authority: '',	func: 'delete'		 },
		delete:			{ trcode: 1008,	authority: '',	func: 'delete'		 },
		list:				{ trcode: 1010,	authority: '',	func: 'list'			 },
		summary:		{ trcode: 1012,	authority: '',	func: 'summary'	 },
		create:			{ trcode: 1100,	authority: '',	func: 'create'		 },
		list:				{ trcode: 1102,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 1104,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 1106,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 1108,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 1110,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 1112,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	athletes
	//---------------------------------------,
	athletes: {
		create:			{ trcode: 10000,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10002,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10004,	authority: '',	func: 'detail'		 },
		save:				{ trcode: 10006,	authority: '',	func: 'save'			 },
		insert:			{ trcode: 10006,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10008,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10010,	authority: '',	func: 'delete'		 },
		merge:			{ trcode: 10012,	authority: '',	func: 'merge'		 },	// athleteIDs를 athlete에 합치기
		view:				{ trcode: 10014,	authority: '',	func: 'view'			 },
		medalList:	{ trcode: 10016,	authority: '',	func: 'medalList' },
		athleteTimes:	{ trcode: 10018,	authority: '',	func: 'athleteTimes' },
		getAthleteExtra:	{ trcode: 10016,	authority: '',	func: 'getAthleteExtra' },
		times:			{ trcode: 10018,	authority: '',	func: 'times'		 },
		searchName:	{ trcode: 10020,	authority: '',	func: 'searchName' },
		timesUnset:	{ trcode: 10022,	authority: '',	func: 'timesUnset' },
	},

	//---------------------------------------,
	//	authority
	//---------------------------------------,
	authority: {
		create:			{ trcode: 10100,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10102,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10104,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10106,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10108,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10110,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 10112,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	communities
	//---------------------------------------,
	communities: {
		create:			{ trcode: 10200,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10202,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10204,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10206,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10208,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10210,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 10212,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	competitions
	//---------------------------------------,
	competitions: {
		create:			{ trcode: 10300,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10302,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10304,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10306,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10308,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10310,	authority: '',	func: 'delete'		 },
		views:			{ trcode: 10312,	authority: '',	func: 'views'		 },
		names:			{ trcode: 10314,	authority: '',	func: 'names'		 },
		years:			{ trcode: 10316,	authority: '',	func: 'years'		 },
		monthGroup:	{ trcode: 10318,	authority: '',	func: 'monthGroup' },
		ageGroup:		{ trcode: 10320,	authority: '',	func: 'ageGroup'	 },
		upcomming:	{ trcode: 10322,	authority: '',	func: 'upcomming' },
		medals:			{ trcode: 10324,	authority: '',	func: 'medals'		 },
		getMedals:	{ trcode: 10326,	authority: '',	func: 'getMedals' },
		times:			{ trcode: 10328,	authority: '',	func: 'times'		 },
		competitionTimes:	{ trcode: 10330,	authority: '',	func: 'competitionTimes' },
		disciplineTimes:	{ trcode: 10332,	authority: '',	func: 'disciplineTimes' },
	},

	//---------------------------------------,
	//	crawling
	//---------------------------------------,
	crawling: {
		create:			{ trcode: 10400,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10402,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10404,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10406,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10408,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10410,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 10412,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	customer
	//---------------------------------------,
	customer: {
		list:				{ trcode: 10416,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10418,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10420,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10422,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10424,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 10426,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	images
	//---------------------------------------,
	images: {
		list:				{ trcode: 10430,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10432,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10434,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10436,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10438,	authority: '',	func: 'delete'		 },
		upload:			{ trcode: 10440,	authority: '',	func: 'upload'		 },
	},

	//---------------------------------------,
	//	graph
	//---------------------------------------,
	graph: {
		create:			{ trcode: 10500,	authority: '',	func: 'create'		 },	// create, index 'comments'
		detail:			{ trcode: 10504,	authority: '',	func: 'detail'		 },
		build:			{ trcode: 10512,	authority: '',	func: 'build'		 },
	},

	//---------------------------------------,
	//	history
	//---------------------------------------,
	history: {
		create:			{ trcode: 10600,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10602,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10604,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10606,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10608,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10610,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 10612,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	latest
	//---------------------------------------,
	latest: {
		create:			{ trcode: 10700,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10702,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10704,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10706,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10708,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10710,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 10710,	authority: '',	func: 'summary'	 },
		latests:		{ trcode: 10712,	authority: '',	func: 'latests'	 },
	},

	//---------------------------------------,
	//	logs
	//---------------------------------------,
	logs: {
		create:			{ trcode: 10700,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10702,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10704,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10706,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10708,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10710,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 10712,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	modeling
	//---------------------------------------,
	modeling: {
		create:			{ trcode: 10800,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10802,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10804,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10806,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10808,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10810,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 10812,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	personalBest
	//---------------------------------------,
	personalBest: {
		create:			{ trcode: 10900,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 10902,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 10904,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 10906,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 10908,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 10910,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 10912,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	pools
	//---------------------------------------,
	pools: {
		create:			{ trcode: 11000,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 11002,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 11004,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 11006,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 11008,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 11010,	authority: '',	func: 'delete'		 },
	},

	//---------------------------------------,
	//	reactions
	//---------------------------------------,
	reactions: {
		create:			{ trcode: 11100,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 11102,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 11104,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 11106,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 11108,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 11110,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 11112,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	records
	//---------------------------------------,
	records: {
		create:			{ trcode: 11200,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 11202,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 11204,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 11206,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 11208,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 11210,	authority: '',	func: 'delete'		 },
		newRecords:	{ trcode: 11210,	authority: '',	func: 'newRecords' },
		recordTimes:	{ trcode: 11212,	authority: '',	func: 'recordTimes' },
	},

	//---------------------------------------,
	//	replies
	//---------------------------------------,
	replies: {
		create:			{ trcode: 11300,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 11302,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 11304,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 11306,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 11308,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 11310,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 11312,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	tags
	//---------------------------------------,
	tags: {
		create:			{ trcode: 11500,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 11502,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 11504,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 11506,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 11508,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 11510,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 11512,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	teams
	//---------------------------------------,
	teams: {
		create:			{ trcode: 11600,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 11602,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 11604,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 11606,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 11608,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 11610,	authority: '',	func: 'delete'		 },
		view:				{ trcode: 11612,	authority: '',	func: 'view'			 },
		statistics:	{ trcode: 11614,	authority: '',	func: 'statistics' },
	},

	//---------------------------------------,
	//	times
	//---------------------------------------,
	times: {
		create:			{ trcode: 117400,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 117402,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 117404,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 117406,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 117408,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 117410,	authority: '',	func: 'delete'		 },
		searchNames:	{ trcode: 117412,	authority: '',	func: 'searchNames' },
		top100:			{ trcode: 117414,	authority: '',	func: 'top100'		 },
		updateTimesAthleteID:	{ trcode: 117416,	authority: '',	func: 'updateTimesAthleteID' },
		removeTimesAthleteID:	{ trcode: 117418,	authority: '',	func: 'removeTimesAthleteID' },
	},

	//---------------------------------------,
	//	users
	//---------------------------------------,
	users: {
		create:			{ trcode: 11800,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 11802,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 11804,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 11806,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 11808,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 11810,	authority: '',	func: 'delete'		 },
		searchNames:	{ trcode: 11812,	authority: '',	func: 'searchNames' },
		create:			{ trcode: 11900,	authority: '',	func: 'create'		 },	// create, index 'comments'
		detail:			{ trcode: 11904,	authority: '',	func: 'detail'		 },
		build:			{ trcode: 11912,	authority: '',	func: 'build'		 },
		create:			{ trcode: 12000,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 12002,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 12004,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 12006,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 12008,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 12010,	authority: '',	func: 'delete'		 },
	},

	//---------------------------------------,
	//	workouts
	//---------------------------------------,
	workouts: {
		create:			{ trcode: 20000,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 20002,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 20004,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 20006,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 20008,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 20010,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 20012,	authority: '',	func: 'summary'	 },
		create:			{ trcode: 20100,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 20102,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 20104,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 20106,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 20108,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 20110,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 20112,	authority: '',	func: 'summary'	 },
		create:			{ trcode: 20200,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 20202,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 20204,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 20206,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 20208,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 20210,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 20212,	authority: '',	func: 'summary'	 },
		create:			{ trcode: 20300,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 20302,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 20304,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 20306,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 20308,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 20310,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 20312,	authority: '',	func: 'summary'	 },
	},

	//---------------------------------------,
	//	etc
	//---------------------------------------,
	etc: {
		create:			{ trcode: 20400,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 20402,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 20404,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 20406,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 20408,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 20410,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 20412,	authority: '',	func: 'summary'	 },
		create:			{ trcode: 20500,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 20502,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 20504,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 20506,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 20508,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 20510,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 20512,	authority: '',	func: 'summary'	 },
		create:			{ trcode: 20600,	authority: '',	func: 'create'		 },	// create, index 'comments'
		list:				{ trcode: 20602,	authority: '',	func: 'list'			 },
		detail:			{ trcode: 20604,	authority: '',	func: 'detail'		 },
		insert:			{ trcode: 20606,	authority: '',	func: 'insert'		 },
		update:			{ trcode: 20608,	authority: '',	func: 'update'		 },
		delete:			{ trcode: 20610,	authority: '',	func: 'delete'		 },
		summary:		{ trcode: 20612,	authority: '',	func: 'summary'	 },	// summary------
	},
}
