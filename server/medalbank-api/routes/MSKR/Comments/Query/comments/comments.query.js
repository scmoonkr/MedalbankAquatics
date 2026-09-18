const extend 			= require('node.extend');
const mongoCFG  	= require('../../Config/mongoCFG');
const utilLibrary	= require("../../Util/utilLibrary");
const {Options}   = require("./options");

const _commentCount = 10;
const _replyCount = 10;
const _participationCount = 2;
const _contributionCount = 2;

//-------------------------------------
exports.Lookup = {

	comments: (dbType, dbID) => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.comments,
				pipeline: [
					{ $match: {
						  $expr: {
								$and: [
									{ $eq: [ "$dbType", dbType ] },
									{ $eq: [ "$dbID", dbID ] }
								]
							}
						},
          },
					{ $project: { _id:0, indexes:0, } },
					{ $limit: _commentCount },
					{ $sort: { commentID: -1 } }
				],
				as: "comments"
			}
		}

		return query;
	},

	replies: (commentID) => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.replies,
        let : { "commentID": "$commentID" },
				pipeline: [
					{ $match: { $expr: { $eq: [ "$commentID", "$$commentID" ] } } },
					// { $lookup: {
					// 		from : "users",
					// 		let: { userID: "$userID" },
					// 		pipeline: [
					// 				{ $match: { $expr: { $eq: [ "$userID", "$$userID" ] } } }
					// 		],
					// 		as : "users"
					// 	}						
					// },
					{ $project: { _id:0, indexes:0, } },
					{ $limit: _replyCount },
					{ $sort: { replyID: -1 } }
				],
				as: "replies"
			}
		}

		return query;
	},
	reactions: (group, project, dbType) => {
		const query =	[
			{ $lookup: {
					from: mongoCFG.Medalbank.reactions,
					let: { dbID: `$${dbType}ID` },
					pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: [ "$dbType", dbType ] },
										{ $eq: [ "$dbID", "$$dbID" ] }
									]
								}
							}
						}
					],
					as: "reactions"
				}
			},
			{ $group: { 
					_id: { 
						dbType    	: "$dbType", dbID: "$dbID",
						likes     	: { $ifNull: [{ $sum: "$reactions.likes" 	  		}, 0] },
						dislikes  	: { $ifNull: [{ $sum: "$reactions.dislikes" 	  }, 0] },
						blinds    	: { $ifNull: [{ $sum: "$reactions.blinds" 	  	}, 0] },
						pins      	: { $ifNull: [{ $sum: "$reactions.pins" 	  		}, 0] },
						captures  	: { $ifNull: [{ $sum: "$reactions.captures" 	  }, 0] },
						shares    	: { $ifNull: [{ $sum: "$reactions.shares" 	  	}, 0] },
						views     	: { $ifNull: [{ $sum: "$reactions.views" 	  		}, 0] },
						follows   : { $ifNull: [{ $sum: "$reactions.follows" 	  }, 0] },
						followedBys	: { $ifNull: [{ $sum: "$reactions.followedBys"	}, 0] },

						pizzas    	: { $ifNull: [{ $avg: "$reactions.pizzas" 	  	}, 0] },
						ratings   	: { $ifNull: [{ $avg: "$reactions.commentID" 	  }, 0] },
					}, 
					...group,
				}
			},
			{ $project: project },
		];
		// console.log("reactions----", JSON.stringify(query, null, "  "));

		return query;
	},
	reactionsList: (group, dbType, dbID) => {
		const project = {
			commentID: 1,
			dbType: 1,
			dbID: 1,
			userID: 1,
			nickname: 1,
			avatar: 1,
			status: 1,
			isVerified: 1,
			title: 1,
			excerpt: 1,
			content: 1,
			categories: 1,
			tags: 1,
			featured: 1,
			images: 1,
			reactions   : "$_id",
			myReactions	: { $arrayElemAt: [ "$myReactions", 0 ] },
			// replyCount: { $size: "$replies" },
			_id         : 0,
		};
		let _id = {};
		if (dbType == "comment" || dbType == "reply") {
			_id[`${dbType}ID`] = `$${dbType}ID`;
		} else {
			_id = { dbType: dbType, dbId: dbID };
		}

		const query =	[
			{ $lookup: {
					from: mongoCFG.Medalbank.reactions,
					let: { dbID: `$${dbType}ID` },
					pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: [ "$dbType", dbType ] },
										{ $eq: [ "$dbID", "$$dbID" ] }
									]
								}
							}
						}
					],
					as: "reactions"
				}
			},
			{ $group: { 
					_id: { 
						..._id,
						likes     	: { $ifNull: [{ $sum: "$reactions.likes" 	  		}, 0] },
						dislikes  	: { $ifNull: [{ $sum: "$reactions.dislikes" 	  }, 0] },
						blinds    	: { $ifNull: [{ $sum: "$reactions.blinds" 	  	}, 0] },
						pins      	: { $ifNull: [{ $sum: "$reactions.pins" 	  		}, 0] },
						captures  	: { $ifNull: [{ $sum: "$reactions.captures" 	  }, 0] },
						shares    	: { $ifNull: [{ $sum: "$reactions.shares" 	  	}, 0] },
						views     	: { $ifNull: [{ $sum: "$reactions.views" 	  		}, 0] },
						follows   : { $ifNull: [{ $sum: "$reactions.follows" 	  }, 0] },
						followedBys	: { $ifNull: [{ $sum: "$reactions.followedBys"	}, 0] },

						pizzas    	: { $ifNull: [{ $avg: "$reactions.pizzas" 	  	}, 0] },
						ratings   	: { $ifNull: [{ $avg: "$reactions.ratings" 	  }, 0] },
					}, 
					...group,
				}
			},
			{ $project: project },
		];
		// console.log("reactions----", JSON.stringify(query, null, "  "));

		return query;
	},

	myReactions: (dbType, myUserID) => {
		const query =	[
			{ $lookup: {
					from: mongoCFG.Medalbank.reactions,
					let: { dbID: `$${dbType}ID` },
					// let: { dbID: "$dbID" },
					pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: [ "$dbType", dbType ] },
										{ $eq: [ "$dbID", "$$dbID" ] },
										{ $eq: [ "$userID", myUserID ] }
									]
								}
							}
						}
					],
					as: "myReactions"
				}
			},
			{ $project: { _id:0 } },
			{ $unwind: { path : '$myReactions', preserveNullAndEmptyArrays: true } }
		];
		// console.log("~~~~~~~~~~~~~~~~", myUserID, dbType);
		// console.log("myReactions----", JSON.stringify(query, null, "  "));
		return query;
	},

	participations: (dbType) => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.participations,
				let: { dbID: `$${dbType}ID` },
				pipeline: [
					{ $match: {
						$expr: {
								$and: [
									{ $eq: [ "$dbType", dbType ] },
									{ $eq: [ "$dbID", "$$dbID" ] }
								]
							}
						} 
					},
					{ $project: { _id:0, indexes:0, } },
					{ $limit: _participationCount },
					{ $sort: { participationID: -1 } }
				],
				as: "participations"
			}
		}

		return query;
	},

	contributions: (dbType) => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.contributions,
				let: { dbID: `$${dbType}ID` },
				pipeline: [
					{ $match: {
						$expr: {
								$and: [
									{ $eq: [ "$dbType", dbType ] },
									{ $eq: [ "$dbID", "$$dbID" ] }
								]
							}
						} 
					},
					{ $project: { _id:0, indexes:0, } },
					{ $limit: _contributionCount },
					{ $sort: { contributionID: -1 } }
				],
				as: "contributions"
			}
		}

		return query;
	},

	users: () => {
		const query =	{
			$lookup:{
				from				: mongoCFG.Medalbank.users,
				localField	: "userID",
				foreignField: "userID",
				as					: "users"
			}
		}

		return query;
	},

	follows: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.follows,
				let: { userID: "$userID" },
				pipeline: [
					{ $match: {
						$expr: {
								$and: [
									{ $eq: [ "$dbType", "user" ] },
									{ $eq: [ "$dbID", "$$userID" ] }
								]
							}
						} 
					},
					{ $project: { _id:0, } }
				],
				as: "follows"
			}
		}

		return query;
	},

	followedBys: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.follows,            
				let: { userID: "$userID" },
				pipeline: [
					{ $match: { $expr: { $eq: [ "$userID", "$$userID" ] } } },
					{ $project: { _id:0, } },
				],
				as: "followedBys"
			}
		}

		return query;
	},

}

//-------------------------------------
//-------------------------------------
exports.List = {
	//-----> comments
	comments: (body) => {
		const group = {
			commentID	   	: { $first: "$commentID" },
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
			commentID		: 1,
			dbType			: 1,
			dbID				: 1,
			userID			: 1,
			nickname		: 1,
			avatar			: 1,
			status			: 1,
			isVerified	: 1,
			title				: 1,
			excerpt			: 1,
			content			: 1,
			categories	: 1,
			tags				: 1,
			featured		: 1,
			images			: 1,
			reactions   : 1,
			myReactions	: 1,
			replyCount	: { $size: "$replies" },
			replies			: 1,
		};
		const dbType = "comment";
		const dbID = Number(body.dbID);

		let query = {};
		if 			(body.dbType) 		query = { dbType: body.dbType, dbID: dbID };
		else if (body.actionType) query = { actionType: body.actionType };
		else if (body.category) 	query = { category: body.category };
		else if (body.tag) 				query = { tags: body.tag };
	
		const context	= Options.options(body);
		const sort 		= { $sort: Object.keys(context.sort).length == 0 ? { commentID: -1 } : context.sort };
		const limit 	= { $limit: context.limit };
		const skip 		= { $skip: context.skip };
	
		const aggregate = [
			{ $match: query },
			...this.Lookup.reactionsList(group, dbType, dbID),
			...this.Lookup.myReactions(dbType, Number(body.userID)),
			// this.Lookup.users(Number(body.userID)),
			this.Lookup.replies(Number(body.userID)),
			{ $project: project },
			sort, // { $sort : { commentID: -1 } },
			skip, // { $skip : 3 },
			limit, // { $limit : 3 },
		]
		return aggregate;
	},
	replies: (body) => {
		const group = {
			replyID	   		: { $first: "$replyID" },
			commentID	   	: { $first: "$commentID" },
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
			categories		: { $first: "$categories" },
			tags		      : { $first: "$tags" },
			featured     	: { $first: "$featured" },
			images	      : { $first: "$images" },
			created	      : { $first: "$created" },
			updated	      : { $first: "$updated" },
		};
		const project = {
			replyID: 1,
			commentID: 1,
			dbType: 1,
			dbID: 1,
			userID: 1,
			nickname: 1,
			avatar: 1,
			status: 1,
			isVerified: 1,
			title: 1,
			excerpt: 1,
			content: 1,
			categories: 1,
			tags: 1,
			featured: 1,
			images: 1,
			created: 1, updated: 1,
			reactions:"$_id", _id:0,
		};
		const dbType = "reply";
		const dbID = Number(body.dbID);

		const query = {};
	  if (body.title    ) query.title     = new RegExp(body.title, "gi")
    if (body.commentID) query.commentID = Number(body.commentID);
    if (body.dbType   ) query.dbType    = body.dbType.trim();
    if (body.dbID     ) query.dbID      = Number(body.dbID);
    if (body.dbType   ) query.dbType    = body.dbType.trim();
    if (body.tag      ) query.tags      = { $in: body.tag.trim() };
    if (body.category ) query.category  = { $in: body.category.trim() };

		const context	= Options.options(body);
		const sort 		= { $sort: Object.keys(context.sort).length == 0 ? { replyID: -1 } : context.sort };
		const limit 	= { $limit: context.limit };
		const skip 		= { $skip: context.skip };
	
		const aggregate = [
			{ $match: query },
			...this.Lookup.reactionsList(group, dbType, dbID),
			...this.Lookup.myReactions(dbType, Number(body.userID)),
			sort, // { $sort : { commentID: -1 } },
			skip, // { $skip : 3 },
			limit, // { $limit : 3 },
		]
		console.log(JSON.stringify(aggregate, null, '  '));
		return aggregate;
	},
	reactions: (body) => {
	},
	tags: (body) => {
	},
	participations: (body) => {
	},
	contributions: (body) => {
	},
	follows: (body) => {
	},
}

//-------------------------------------
//-------------------------------------
exports.Detail = {
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
			...this.Lookup.reactions(group, project, dbType),
			...this.Lookup.myReactions(dbType, Number(body.myUserID)), // parentType
			this.Lookup.participations(dbType),
			this.Lookup.contributions(dbType),
			this.Lookup.rankings(dbType),

			this.Lookup.teams(),
			this.Lookup.bikes(),
			this.Lookup.items(),
			this.Lookup.activities(),
			this.Lookup.segments(),
			this.Lookup.races(),
			this.Lookup.footprints(),
			this.Lookup.posts(),
			this.Lookup.follows(),
			this.Lookup.followedBys(),
		]
	
		return aggregate;
	},
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
			...this.Lookup.reactions(group, project, dbType),
			...this.Lookup.myReactions(dbType, Number(body.myUserID)),
			this.Lookup.participations(dbType),
			this.Lookup.contributions(dbType),
		]
		return aggregate;
	},
	footprints: (body) => {
	},
	tags: (body) => {
	},
	participations: (body) => {
	},
	contributions: (body) => {
	},
	//-----> comments
	comments: (body) => {
		const group = {
			commentID	   	: { $first: "$commentID" },
			dbType		   	: { $first: "$dbType" },
			dbID	   			: { $first: "$dbID" },
			userID   			: { $first: "$userID" },
			nickname     	: { $first: "$nickname" },
			// avatar      	: { $first: "$avatar" },
			status    		: { $first: "$status" },
			isVerified   	: { $first: "$isVerified" },
			title	     		: { $first: "$title" },
			excerpt	      : { $first: "$excerpt" },
			content			 	: { $first: "$content" },
			categories		: { $first: "$categories" },
			tags		      : { $first: "$tags" },
			featured     	: { $first: "$featured" },
			images	      : { $first: "$images" },
			created	      : { $first: "$created" },
			updated	      : { $first: "$updated" },
			deleted	      : { $first: "$deleted" },
			users	     		: { $first: "$users" },
		};
		const project = {
			commentID		: 1,
			dbType			: 1,
			dbID				: 1,
			userID			: 1,
			nickname		: 1,
			avatar			: 1,
			status			: 1,
			isVerified	: 1,
			title				: 1,
			excerpt			: 1,
			content			: 1,
			categories	: 1,
			tags				: 1,
			featured		: 1,
			images			: 1,
			reactions   : "$_id",
			myReactions	: { $arrayElemAt: [ "$myReactions", 0 ] },
			replyCount	: { $size: "$replies" },
			_id         : 0,
		};
		const dbType = "comment";
		
		const query = body.query ? body.query : {};
		if 			(body.commentID)	query.commentID = Number(body.commentID);
		else if (body.dbID) 			{ query.dbID = Number(body.dbID); query.dbType = body.dbType; }
		else if (body.category) 	query.category = { $in: body.category };
		else if (body.tags) 			query.tags = { $in: body.tags };

		const aggregate = [
			{ $match: query },
			...this.Lookup.reactions(group, project, dbType),
			...this.Lookup.myReactions(dbType, Number(body.myUserID)),
			// this.Lookup.users(Number(body.userID)),
			this.Lookup.replies(Number(body.commentID)),
			// { $unwind: { path : '$replies', preserveNullAndEmptyArrays: true } }
		]
	
		return aggregate;
	},
	replies: (body) => {
	},
	reactions: (body) => {
	},
	follows: (body) => {
	},
}