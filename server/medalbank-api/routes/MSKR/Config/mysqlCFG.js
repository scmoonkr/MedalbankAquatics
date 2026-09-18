exports.host = "175.207.29.182";
exports.dbDongnebook = "dongnebook";
exports.dbMSK = "MSK";

exports.defalut = {
	limitTable		: 100,
	postPosts  		: 100,
	postReplies 	: 100,
	postComments	: 100,
	day						: 86400000,
}
exports.tableMSK = {
	users 				: "users",

	// images
	images 				: "images",

	// post
	posts 				: "posts",
	comments 			: "comments",
	replies 			: "replies",
	stances 			: "stances",

	// database
	pools 				: "pools",
	poolInfo			: "poolInfo",
	athletes 			: "athletes",
	events 				: "events",
	heats 				: "heats",
	times 				: "times",
	personalBest	: "personalBest",
	categories		: "categories",
	business 			: "business",
	items 				: "items",
	
	// index
	keywords 			: "keywords",
	keywordLink 	: "keywordLink",

	keywordsX 		: "keywordsX",
	keywordLinkX 	: "keywordLinkX",

	//-----> view table: dongnebookSQL/view/create.sql
	timesView			: "timesView",

	modelForm			: "modelForm",
	modelRecords	: "modelRecords",
}

exports.NEWBOOK_TERM = 120; // 360;	// 신간 검색 기간
exports.tableDongnebook = {
	nlcy			: "nlcy",
	loan			: "dongneLoan",
	account		: "account",
	holding		: "dongneHolding",
  config		: "dongneConfig",
  
	contents	: "contents",
	index		  : "indexes",
	review	  : "review",
	holding	  : "holding",
	// edition	  : "contentsEdition",
}


exports.tableLS = {
	loan			: "dongneLoan",
	account		: "account",
	holding		: "dongneHolding",
	config		: "dongneConfig",
	contents	: "contents",	
}

exports.indexCode = {
	post			: 'p',
	comment		: 'c',
	reply			: 'r',
	database	: 'd',
}
//type: email, name, nickname, address, tag, category, dob, post,
exports.indexType = {
	email		: 'em',
	nickname: 'ni',
	name		: 'na',
	title		: 'ti',
	address	: 'ad',
	tag			: 'ta',
	category: 'ca',
	dob			: 'do',
	registered: 're',
}
