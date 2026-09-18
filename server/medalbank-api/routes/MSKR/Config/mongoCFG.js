
let pathdir = "";
if (!process.env.MONGO_USERNAME) {
	pathdir = `${__dirname}/../../..`;
}
const path = require('path');
require('dotenv').config({ path: `${pathdir}/.env`});


exports.sizePdfDir = "/temp/";

exports.Medalbank = {
	database			: "Medalbank",

	JWT						: "JWT",
	times					: "times",
	timesOLD			: "timesOLD",
	stems					: "stems",
	competitions	: "competitions",
	athletes			: "athletes",
	teams					: "teams",
	pools					: "pools",
	leaderboard		: "leaderboard",
	images				: "images",
	users					: "users",
	items					: "items",
	collections		: "collections",
	config				: "config",
	ootd					: "ootd",
	timesImport		: "timesImport",
	reports				: "reports",
	history				: "history",
	mediaServer		: "mediaServer",
	timesSimulation	: "times_simulation",
	modeling			: "modeling",
	search				: "search",
	comments			: "comments",
	replies				: "replies",
	reactions			: "reactions",




	// sports.or.kr
	newRecords						: "newRecords",
	newRecordsNew					: "newRecordsNew",
	eliteAthletes					: "sportsAthletes",
	eliteCompetitionList	: "sportsCompetitions",
	eliteTimes						: "sportsTimes",


	competitionsInfo: "competitionsInfo",
	heats				: "heats",
	records			: "records",
	teamsInfo		: "teamsInfo",
	teamsCompetitions	: "teamsCompetitions",
	teamsSummary			: "teamsSummary",

	crawling		: "crawling",
	categories	: "categories",
	products		: "products",
	orders			: "orders",
	images			: "images",
	imagesAiden	: "imagesAiden",
	pdfImages		: "pdfImages",

	// crawling 대한수영연맹
	sportsAthletes: "sportsAthletes",
	sportsCompetitions: "sportsCompetitions",
	sportsTimes: "sportsTimes",
	
	// crawling world aquastics
	worldaquaticsAthletes: "worldaquaticsAthletes",
	worldaquaticsCompetitions: "worldaquaticsCompetitions",
	worldaquaticsTimes: "worldaquaticsTimes",

	// crawling myRanking
	myRankingAthletes: "myRankingAthletes",
	myRankingCompetitions: "myRankingCompetitions",
	myRankingTimes: "myRankingTimes",
	myRankingCrawlingNames: "myRankingCrawlingNames",
}

exports.MSKR = {		
	database	: "MedalBank",
	databaseNew	: "MSKR",
	// database	: "Test",
	// databaseNew	: "Test",
	databaseTest	: "Test",
		
	// medalbank	
	search	: "search",
		
	statisticsMB	: "statistics",
	athletes	: "athletes",
	// athletesMB	: "athletes_medalbank",
	athletesMB	: "athletes_MSKR",
	athletesMSKR	: "athletes_MSKR",
	athletesInfoMB	: "athletes_medalbank_info",
	athletesViewMB	: "athletes_view_medalbank",
		
	athletesViewAll	: "athletes_info_statics_view",
	athletesViewInfo	: "athletes_info_view",
	athletesListView	: "athletesListView",
	athletesView	: "athletesView",
		
	athletesInfo	: "athletesInfo",
	athletesInfoNew	: "athletesInfoNew",
	athletesImport	: "athletesImport",
	athletesMerge	: "athletesMerge",

	// sports.or.kr
	newRecords						: "newRecords",
	eliteAthletes				: "sportsAthletes",
	eliteCompetitionList	: "sportsCompetitions",
	eliteTimes						: "sportsTimes",
		

	images	: "images",
	times	: "times",
	// timesMB	: "times_medalbank",
	timesSimulation	: "times_simulation",
	timesMB	: "times_MSKR",
	timesMSKR	: "times_MSKR",
	leaderboards	: "leaderboards", // { gender, style, course, disnce, times: [] }
	leaderboardMB	: "leaderboard_medalbank",
		
	mediaServer	: "mediaServer",
	categories    	: "categories",
	menus	: "menus",
	names	: "names",
	questions	: "questions",
	questionUsers	: "questionUsers",
		
	modeling	: "modeling",
	config	: "config",
	items	: "items",
	ootd	: "ootd",
		
	timesImport	: "timesImport",
		
	//-----> common	
	JWT	: "jwt",
	users 	: "users",
	usersMB	: "users_medalbank",
	teams	: "teams",
	teamStatics	: "teamStatics",
	teamsMB	: "teams_medalbank",
	teamStaticsMB	: "teams_statistics_medalbank",
	teamsCompetitions	: "teamsCompetitions",
	teamPoints	: "teamPoints",
	teamsSummary	: "teamsSummary",
	teamsInfo	: "teamsInfo",
	teamsView	: "teamsView",
	document	: "document",
	profiles 	: "profiles",
	activities	: "activities",
		
	reports	: "reports",
	//-----> database	
	pools	: "pools",
	poolsMB	: "pools_medalbank",
	poolsInfo	: "poolsInfo",
	poolsView	: "poolsView",
	stems	: "stems",
	stemsMB	: "stems_MSKR",
	stemsMSKR	: "stems_MSKR",
	stemsStatisticsMB	: "stems_statistics_medalbank",
	competitions	: "competitions",
	// competitionsMB	: "competitions_medalbank",
	competitionsMB	: "competitions_MSKR",
	competitionsMSKR	: "competitions_MSKR",
	competitionsStatics	: "competitions_statistics",
	// competitionsStaticsMB	: "competitions_statistics_medalbank",
	competitionsStaticsMB	: "competitions_statistics_MSKR",
	competitionsStatisticsMSKR	: "competitions_statistics_MSKR",
	competitionsInfo	: "competitionsInfo",
	competitionsView	: "competitionsView",
	// personalBest	: "personalBest",
	// personalBestView	: "personalBestView",
	personalBest	: "rankings",
	heats	: "heats",
	graph	: "graph",
	records	: "records",
	recordsMB	: "records_medalbank",
	leaderboard   	: "leaderboard",
	history	: "history",
	historyMB	: "history_medalbank",
	timesNew	: "timesNew",
	users	: "users",
	rankings	: "rankings",
	updateLogs 	: "updateLogs",
		
	//-----> workouts	
	workouts	: "workouts",
	meetups	: "meetups",
	meetupUsers	: "meetupUsers",
		
	//-----> socialMedia  	
	socialMedias    	: "socialMedias",
	socialReactions 	: "socialReactions",
		
	//-----> comments	
	communities	: "communities",
	communitiesView	: "communitiesView",
	communitiesListView	: "communitiesListView",
		
	comments	: "comments",
	replies	: "replies",
	repliesView	: "repliesView",
	follows	: "follows",
	reactions	: "reactions",
	reactionsMB	: "reactions_medalbank",
	tags	: "tags",
	images	: "images",
	posts	: "posts",
		
	logs	: "logs",
	databaseNew	: "MSKR",
		
	timesViewMB	: "times_view_medalbank",
	competitionsViewMB	: "competitions_view_medalbank",
	teamsViewMB	: "teams_view_medalbank",
	poolsViewMB	: "pools_view_medalbank",
		
	timesStatisticsMB	: "times_statistics_medalbank",
	athletesStatisticsMB	: "athletes_statistics_medalbank",
	teamsStatisticsMB	: "teams_statistics_medalbank",
	poolsStatisticsMB	: "pools_statistics_medalbank",
}	

exports.collectionTable = {
	"athletes"		: { url: "a", 						collection: this.MSKR.athletes, 		id: "athleteID" },
	"times"				: { url: "times", 				collection: this.MSKR.times, 				id: "timeID" },
	"competitions": { url: "competitions", 	collection: this.MSKR.competitions, id: "competitionID" },
	"pools"				: { url: "pools", 				collection: this.MSKR.pools, 				id: "poolID" },
	"teams"				: { url: "teams", 				collection: this.MSKR.teams, 				id: "teamID" },
	"items"				: { url: "items", 				collection: this.MSKR.items, 				id: "itemID" },
};	



exports.contants = {
	dirDownload	: "download",
	dirZIP 			: "zip",
	dirFIT 			: "fit",
}
//======================================================
//======================================================

exports.mediaServer =   "http://mediaserver.dongnebook.org";
//exports.mediaServer =   "http://localhost:3999";

exports.MAIL_ID     = "webmaster@libraryschool.kr";
exports.MAIL_PASSWORD  = (process.env.MAIL_PASSWORD || "");

exports.naver_client_id = "suKRCIg5n3Vpy6obR_3P";
exports.naver_client_secret = "ItHYOVX5yw";

exports.NAVER_API_URL = 'https://openapi.naver.com/v1/search/book.json?query='; // json 결과
//exports.TONJIN_URL = "http://gimpo.go.kr/tongjin/bookSearchList.do?key=3120&rep=1&searchType=detail&manageCode=TJ&searchTitle=&searchKeyword=";
exports.TONJIN_URL = "http://gimpo.go.kr/tongjin/bookSearchList.do?key=3120&rep=1&searchType=detail&manageCode=TJ&pageUnit=10&searchKeyword=";
exports.YANGGOG_URL = "http://gimpo.go.kr/yanggok/bookSearchList.do?key=2917&rep=1&searchCnd=&pageUnit=10&manageCode=YG&searchKrwd=";

exports.NEWBOOK_TERM = 720; // 360;	// 신간 검색 기간

// reset email message
exports.resetEmail = {
	siteTitle 	: "DongneBook",
	homepage 		: this.dongnebookServer,
	logo 				: "http://mediaserver.dongnebook.org/cms/book/0000000000000",
	phone 			: "1588-9963",
	address 		: "우) 22176 인천시 미추홀구 낙섬중로 129 LH미추홀 303-100",
}

// kakao
exports.KAKAO_PORT	= 8080;
exports.KAKAO_KEY		= "99e93c385a308ad28494fec811fa3ab4";

// exports.url 		=	'mongodb://175.207.29.182:5050';
exports.mongo_url	=	`mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PWD}@${process.env.MONGODB_ADDR}/admin`;
// exports.mongo_url	=	`mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PWD}@${process.env.MONGODB_ADDR}`;


// console.log("=====================================");
// console.log(this.mongo_url);
// console.log("=====================================");
// mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
