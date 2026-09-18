const extend 			= require('node.extend');
const mongoCFG  	= require('../../Config/mongoCFG');
const utilLibrary	= require("../../Util/utilLibrary");
const {Options}   = require("./options");
const {Lookup}    = require("./lookup");
const {Group}    = require("./group");
const {Project}   = require("./project");

const _itemsPerPage = 20;
const _commentCount = 10;
const _replyCount = 10;
const _bikeCount = 2;
const _participationCount = 2;
const _contributionCount = 2;

//-------------------------------------
//-------------------------------------
exports.ListQuery = {
	//---------------------------
	users: (body) => {
		const context = Options.options(body);
		context.projection 	= {
			_id					: 0, 
			userID			: 1, 
			nickname		: 1, 
			fullName		: 1, 
			avatar			: 1, 
			gender			: 1, 
			dob					: 1, 
			email				: 1, 
			timezone		: 1,
			nationality	: 1, 
			cities			: 1,
		};

		if (body.cmd == "and") {  // { cmd: "and", data: [ {cmd, data}, {cmd, data}, {cmd, data}] }
			const query = [];
			body.data.forEach(el => {
				query.push(queryAND(el));
			})
			context.query = query;
		} else {
			context.query = queryAND(body);
		}

		return context;
		//---------------------------
		function queryAND (body) {
			let query = {};
			switch (body.cmd) {
				case "name":
					const name = new RegExp("^" + body.data, "gi");
					query = { $or: [ { fullName: name }, { firstName: name }, { lastName: name }] };
					break;
				case "phone":
					query[body.cmd] = utilLibrary.normalizeString( body.data);
					break;
				case "name":
					query[body.cmd] = new RegExp("^" + body.data, "gi");
					break;
			}
			return query;
		}
		//---------------------------
	},
	//---------------------------
	teams: (body) => {
		const context = Options.options(body);
		context.projection 	= {
			_id						: 0, 
			teamID				: 1,
			teamCode 			: 1,
			teamClass			: 1,
			year 					: 1, 
			teamName			: 1, 
			fullName			: 1, 
			imageLogo			: 1, 
			gender				: 1, 
			coach 				: 1, 
			gender				: 1, 
			tags					: 1,
		};

		if (body.cmd == "and") {  // { cmd: "and", data: [ {cmd, data}, {cmd, data}, {cmd, data}] }
			const query = [];
			body.data.forEach(el => {
				query.push(queryAND(el));
			})
			context.query = query;
		} else {
			context.query = queryAND(body);
		}

		return context;
		//---------------------------
		function queryAND (body) {
			let query = {};
			switch (body.cmd) {
				case "name":
					const name = new RegExp("^" + body.data, "gi");
					query = { $or: [ { fullName: name }, { teamName: name }] };
					break;
				case "class":
					query.teamClass = body.data.trim();
					break;
			}
			return query;
		}
		//---------------------------
	},
	//---------------------------
	document: (body) => {
		const context = Options.options(body);
		context.projection 	= {
			_id					: 0, 
			docID				: 1,
			title 			: 1,
			tags				: 1,
			categories	: 1, 
			author			: 1, 
			datetime		: 1,
		};

		if (body.cmd == "and") {  // { cmd: "and", data: [ {cmd, data}, {cmd, data}, {cmd, data}] }
			const query = [];
			body.data.forEach(el => {
				query.push(queryAND(el));
			})
			context.query = query;
		} else {
			context.query = queryAND(body);
		}

		return context;
		//---------------------------
		function queryAND (body) {
			let query = {};
			switch (body.cmd) {
				case "title":
				case "content":
				case "result":
					query[body.cmd] = new RegExp("^" + body.data + "^", "gi");
					break;
				case "tags":
				case "categories":
				case "author":
						query[body.cmd] = body.data.trim();
					break;
				case "datetime":
						query.datetime = body.data.trim();
					break;
			}
			return query;
		}
		//---------------------------
	},
	//---------------------------
	footprints: (body) => {
	},
	//---------------------------
	tags: (body) => {
	},
	//---------------------------
	participations: (body) => {
	},
	//---------------------------
	contributions: (body) => {
	},
	communitiesSummary: (rows=5) => {
		const aggregate = [
			{ $sort: { category:1, datetime:-1 }
			},
			{ $group: {
					_id: "$category",
					rows: { $push: "$$ROOT" }
				}
			},
			{ $project: {
					_id: 0,
					category: "$_id",
					rows: { $slice: ["$rows", rows] }
				}
			},
			{ $unwind: "$rows" },
			{ $replaceRoot: { newRoot: "$rows" } },
		]
	
		return aggregate;
	},
	//-----> communities
	communities: (body) => {
		const group = {
			communityID	 	: { $first: "$communityID" },
			dbType		   	: { $first: "$dbType" },
			dbID	   			: { $first: "$dbID" },
			userID   			: { $first: "$userID" },
			nickname     	: { $first: "$nickname" },
			avatar      	: { $first: "$avatar" },
			status    		: { $first: "$status" },
			isVerified   	: { $first: "$isVerified" },
			title	     		: { $first: "$title" },
			excerpt	      : { $first: "$excerpt" },
			content			 	: { $first: "$content" },
			category		  : { $first: "$category" },
			best		      : { $first: "$best" },
			issue		      : { $first: "$issue" },
			categories		: { $first: "$categories" },
			tags		      : { $first: "$tags" },
			featured     	: { $first: "$featured" },
			images	      : { $first: "$images" },
			created	      : { $first: "$created" },
			updated	      : { $first: "$updated" },
			deleted	      : { $first: "$deleted" },
		};
		const project = {
			_id         : 0,
			communityID	: 1,
			// dbType			: 1,
			// dbID				: 1,
			userID			: 1,
			nickname		: 1,
			avatar			: 1,
			status			: 1,
			isVerified	: 1,
			title				: 1,
			// excerpt			: 1,
			// content			: 1,
			category    : 1,
			categories	: 1,
			tags				: 1,
			best				: 1,
			issue				: 1,
		};
		const dbType = "community";
		// const communityID = Number(body.communityID);

		let query = {};
		if (body.category) {
			query = { $or: [
									{ category: body.category },
									{ categories: body.category },
								]
							}; 
		}
		else if (body.title) 		    query.title       = new RegExp(body.title, "gi");
		else if (body.communityID) 	query.communityID = Number(body.communityID);
		else if (body.communityIDs) query.communityID = { $in: body.communityIDs };
		else if (body.tag) 				  query.tags        = body.tag;
	
		const context	= utilLibrary.options(body);
		const sort 		= { $sort: Object.keys(context.sort).length == 0 ? { commentID: -1 } : context.sort };
		const limit 	= { $limit: 200 };
		const skip 		= { $skip: context.skip };
	
		const aggregate = [
			{ $match: query },
			// ...Lookup.reactions(group, dbType, project),
			// ...Lookup.reactionsList(group, dbType, communityID),
			...Lookup.myReactions(dbType, Number(body.userID)),
			Lookup.comments(dbType),
			{ $project: {
					...project,
					reactions   : 1,
					myReactions	: 1,
					commentCount: { $size: "$comments" },
					// comments	: 1,
				}
			},
			sort, // { $sort : { commentID: -1 } },
			skip, // { $skip : 3 },
			limit, // { $limit : 3 },
		]
		return aggregate;
	},
	times: (body) => {
	},
	rankings: (body) => {
	},
}

//-------------------------------------
//-------------------------------------
exports.DetailQuery = {
	//-----> community
	community: (body) => {
		const context	= utilLibrary.options(body);
		const sort 		= { $sort: Object.keys(context.sort).length == 0 ? { commentID: -1 } : context.sort };
		const limit 	= { $limit: context.limit };
		const skip 		= { $skip: context.skip };
	
		const dbType = "community";
		const communityID = Number(body.communityID);

		const aggregate = [
			{ $match: { communityID: communityID } },
			...Lookup.reactions(
				Group.community,
				dbType,
				{
					...Project.community,
					reactions   : "$_id",
					_id         : 0,
				}
			),
			...Lookup.myReactions(dbType, Number(body.userID)),
			Lookup.comments(dbType),
			{ $project: {
					...Project.community,
					reactions   : 1,
					myReactions : 1,
					commentCount: { $size: "$comments" },
					comments		: 1,
				}
			},
			sort,
			skip,
			limit,
		]
		// console.log(JSON.stringify(aggregate, null, '  '));
		return aggregate;
	},
	times: (body) => {
	},
	rankings: (body) => {
	},
	//-----> common
	users: (body) => {
		const group = {
			userID		   	: { $first: "$userID" },
			status	   		: { $first: "$status" },
			isVerified   	: { $first: "$isVerified" },
			nickname     	: { $first: "$nickname" },
			fullName     	: { $first: "$fullName" },
			firstName    	: { $first: "$firstName" },
			lastName    	: { $first: "$lastName" },
			avatar      	: { $first: "$avatar" },
			featured   		: { $first: "$featured" },
			images	     	: { $first: "$images" },
			gender	      : { $first: "$gender" },
			dob			 			: { $first: "$dob" },
			email		      : { $first: "$email" },
			teams		      : { $first: "$teams" },
			instagram     : { $first: "$instagram" },
			strava	      : { $first: "$strava" },
			timezone	    : { $first: "$timezone" },
			nationalities : { $first: "$nationalities" },
			cities	      : { $first: "$cities" },
			languages     : { $first: "$languages" },
			height	      : { $first: "$height" },
			weight	      : { $first: "$weight" },
			inseam	      : { $first: "$inseam" },
			bloodType     : { $first: "$bloodType" },
			tags      		: { $first: "$tags" },
			teamCount  		: { $first: "$teamCount" },
			created	      : { $first: "$created" },
			updated	      : { $first: "$updated" },
			deleted	      : { $first: "$deleted" },
		};
		const project = {
			userID: 1, status: 1, isVerified: 1, nickname: 1, fullName: 1, firstName: 1, lastName: 1,
			avatar: 1, featured: 1, images: 1, gender: 1, dob: 1, email: 1, instagram: 1, strava: 1,
			timezone: 1, nationalities: 1, cities: 1, teamCount: 1, languages: 1, height: 1, weight: 1, 
			inseam: 1, bloodType: 1, tags: 1, created: 1, updated: 1, deleted: 1, _id:0,
			teams: 1, reactions:"$_id", _id:0,
		};

		const dbType = "user";
		const parentType = dbType;

		const aggregate = [
			{ $match: { "userID": Number(body.userID) } },
			...Lookup.reactions(group, project, dbType),
			...Lookup.myReactions(dbType, Number(body.myUserID)), // parentType
			Lookup.participations(dbType),
			Lookup.contributions(dbType),
			Lookup.rankings(dbType),

			Lookup.teams(),
			Lookup.bikes(),
			Lookup.items(),
			Lookup.activities(),
			Lookup.segments(),
			Lookup.races(),
			Lookup.footprints(),
			Lookup.posts(),
			Lookup.follows(),
			Lookup.followedBys(),
		]
	
		return aggregate;
	},
	//---------------------------
	teams: (body) => {
		const group = {
			teamID		   	: { $first: "$teamID" },
			year	   			: { $first: "$year" },
			status     		: { $first: "$status" },
			isVerified   	: { $first: "$isVerified" },
			teamCode     	: { $first: "$teamCode" },
			teamClass    	: { $first: "$teamClass" },
			teamName    	: { $first: "$teamName" },
			fullName     	: { $first: "$fullName" },
			nationality		: { $first: "$nationality" },
			imageLogo    	: { $first: "$imageLogo" },
			imageJersey   : { $first: "$imageJersey" },
			tags      		: { $first: "$tags" },
			website 			: { $first: "$website" },
			instagram     : { $first: "$instagram" },
			teatwitter    : { $first: "$twitter" },
			instagram     : { $first: "$instagram" },
			strava	      : { $first: "$strava" },
			bike			    : { $first: "$bike" },
			gender				: { $first: "$gender" },
			coaches	      : { $first: "$coaches" },
			representatives     : { $first: "$representatives" },
			sportsDirectors	    : { $first: "$sportsDirectors" },
			assSportsDirectors	: { $first: "$assSportsDirectors" },
			sponsors	    : { $first: "$sponsors" },
			userList     	: { $first: "$userList" },
			city  				: { $first: "$city" },
			contact	      : { $first: "$contact" },
			email	      	: { $first: "$email" },
		};
		const project = {
			teamID: 1,
			year: 1,
			status: 1,
			isVerified: 1,
			teamCode: 1,
			teamClass: 1,
			teamName: 1,
			fullName: 1,
			nationality: 1,
			imageLogo: 1,
			imageJersey: 1,
			tags: 1,
			website: 1,
			instagram: 1,
			twitter: 1,
			bike: 1,
			gender: 1,
			coaches: 1,
			representatives: 1,
			sportsDirectors: 1,
			assSportsDirectors: 1,
			sponsors: 1,
			userList: 1,
			city: 1,
			contact: 1,
			email: 1,
			reactions:"$_id", 
		};
		const dbType = "team";
		const parentType = dbType;

		const aggregate = [
			{ $match: { teamID: Number(body.teamID), year: Number(body.year) } },
			// { $lookup: {
			// 		from				: mongoCFG.Medalbank.users,
			// 		localField	: "userID",
			// 		foreignField: "userID",
			// 		as					: "users"
			// 	}
			// },
			...Lookup.reactions(group, project, dbType),
			...Lookup.myReactions(dbType, Number(body.myUserID)),
			Lookup.participations(dbType),
			Lookup.contributions(dbType),
		]
		return aggregate;
	},
	//---------------------------
	footprints: (body) => {
	},
	//---------------------------
	tags: (body) => {
	},
	//---------------------------
	participations: (body) => {
	},
	//---------------------------
	contributions: (body) => {
	},
	//---------------------------
	times: (body) => {
	},
	//---------------------------
	rankings: (body) => {
	},
}