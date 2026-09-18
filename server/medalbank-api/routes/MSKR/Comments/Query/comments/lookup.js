const extend 			= require('node.extend');
const mongoCFG  	= require('../../Config/mongoCFG');
const {Group}    = require("./group");
const {Project}   = require("./project");

const _commentCount = 10;
const groupReactions = {
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
}

//-------------------------------------
exports.Lookup = {
	reactions: (
    group, 
    dbType, 
    proj={
      dbType:1,
      dbID:1,
      userID:1,
      nickname:1,
      avatar:1,
      status:1,
      isVerified:1,
      title:1,
      excerpt:1,
      content:1,
      category:1,
      categories:1,
      tags:1,
      best:1,
      featured:1,
      images:1,
    }) => {
		const project = {
			...proj,
			reactions   : "$_id",
			_id         : 0,
		};
    project[dbType+"ID"] = 1;
		const aggregate =	[
			{ $lookup: {
					from: mongoCFG.Medalbank.reactions,
					let: { dbType: dbType, dbID: `$${dbType}ID` },
					pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: [ "$dbType", "$$dbType" ] },
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
						dbType    	: "$dbType",
            dbID        : "$dbID",
						...Group.reactions,
					}, 
					...group,
				}
			},
			{ $project: project },
		];
		// console.log("reactions----", JSON.stringify(aggregate, null, "  "));

		return aggregate;
	},
	reactionsList: (group, dbType, dbID) => {
		const project = {
			// commentID:1,
			dbType:1,
			dbID:1,
			userID:1,
			nickname:1,
			avatar:1,
			status:1,
			isVerified:1,
			title:1,
			excerpt:1,
			content:1,
			categories:1,
			tags:1,
			featured:1,
			images:1,
			reactions   : "$_id",
			// myReactions	: { $arrayElemAt: [ "$myReactions", 0 ] },
			// replyCount: { $size: "$replies" },
			_id         : 0,
		};
    project[dbType+"ID"] = 1;
		// let _id = {};
		// if (dbType == "comment" || dbType == "reply") {
		// 	_id[`${dbType}ID`] = `$${dbType}ID`;
		// } else {
		// 	_id = { dbType: dbType, dbId: dbID };
		// }
		const aggregate =	[
			{ $lookup: {
					from: mongoCFG.Medalbank.reactions,
					let: { dbType: "$dbType", dbID: `$${dbType}ID` },
					pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: [ "$dbType", "$dbType" ] },
										{ $eq: [ "$dbID", "$dbID" ] }
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
						// ..._id,
            dbType      : "$dbType",
            dbId        : "$dbID",
						...Group.reactions,
					}, 
					...group,
				}
			},
			{ $project: project },
		];
		// console.log("reactions----", JSON.stringify(aggregate, null, "  "));

		return aggregate;
	},

	myReactions: (dbType, myUserID) => {
		const aggregate =	[
			{ $lookup: {
					from: mongoCFG.Medalbank.reactions,
					let: { dbType: dbType, dbID: `$${dbType}ID` },
					pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: [ "$dbType", "$$dbType" ] },
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
		// console.log("myReactions----", JSON.stringify(aggregate, null, "  "));
		return aggregate;
	},

	participations: (dbType) => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.participations,
				let: { dbType: "$dbType", dbID: `$${dbType}ID` },
				pipeline: [
					{ $match: {
						$expr: {
								$and: [
									{ $eq: [ "$dbType", "$dbType" ] },
									{ $eq: [ "$dbID", "$dbID" ] }
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
				let: { dbType: "$dbType", dbID: `$${dbType}ID` },
				pipeline: [
					{ $match: {
						$expr: {
								$and: [
									{ $eq: [ "$dbType", "$dbType" ] },
									{ $eq: [ "$dbID", "$dbID" ] }
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

	rankings: () => {
		const query =	{
			$lookup:{
				from				: mongoCFG.Medalbank.leaderboard,
				localField	: "userID",
				foreignField: "userID",
				as					: "rankings"
			}
		}

		return query;
	},

	comments: (dbType) => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.comments,
				let: { dbType: dbType, dbID: `$${dbType}ID` },
				pipeline: [
					{ $match: {
						  $expr: {
								$and: [
									{ $eq: [ "$dbType", "$$dbType" ] },
									{ $eq: [ "$dbID", "$$dbID" ] }
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

	teams: () => {
		const query =	{
			$lookup:{
				from				: mongoCFG.Medalbank.teams,
				localField	: "teams",
				foreignField: "teamCode",
				as					: "teams"
			}
		}

		return query;
	},

	bikes: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.bikes,
				pipeline: [
					{ $match: { $expr: { $eq: [ "$userID", "$userID" ] } } },
					// { $lookup: {
					// 		from : "users",
					// 		let: { uid: "$userID" },
					// 		pipeline: [
					// 				{ $match: { $expr: { $eq: [ "$userID", "$$uid" ] } } }
					// 		],
					// 		as : "user"
					// 	}						
					// },
					{ $project: { _id:0, indexes:0, } },
					{ $limit: _bikeCount },
					{ $sort: { bikeID: -1 } }
				],
				as: "bikes"
			}
		}

		return query;
	},

	items: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.items,
				pipeline: [
					{ $match: { $expr: { $eq: [ "$userID", "$$userID" ] } } },
					{ $project: { _id:0, indexes:0, } },
					{ $limit: _itemsPerPage },
					{ $sort: { itemID: -1 } }
				],
				as: "items"
			}
		}

		return query;
	},

	activities: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.activities,
				pipeline: [
					{ $match: { $expr: { $eq: [ "$userID", "$$userID" ] } } },
					{ $project: { _id:0, indexes:0, sessions:0, laps:0, box:0, sensors:0, points:0, } },
					{ $limit: _itemsPerPage },
					{ $sort: { activitieID: -1 } }
				],
				as: "activities"
			}
		}

		return query;
	},

	segments: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.segments,
				pipeline: [
					{ $match: { $expr: { $eq: [ "$userID", "$$userID" ] } } },
					{ $project: { _id:0, } },
					{ $limit: _itemsPerPage },
					{ $sort: { segmentID: -1 } }
				],
				as: "segments"
			}
		}

		return query;
	},

	races: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.races,
				pipeline: [
					{ $match: { $expr: { $eq: [ "$userID", "$$userID" ] } } },
					{ $project: { _id:0, } },
					{ $limit: _itemsPerPage },
					{ $sort: { raceID: -1 } }
				],
				as: "races"
			}
		}

		return query;
	},

	footprints: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.footprints,
				pipeline: [
					{ $match: { $expr: { $eq: [ "$userID", "$$userID" ] } } },
					{ $project: { _id:0, } },
					{ $limit: _itemsPerPage },
					{ $sort: { _id: -1 } }
				],
				as: "footprints"
			}
		}

		return query;
	},

	posts: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.posts,
				pipeline: [
					{ $match: { $expr: { $eq: [ "$userID", "$$userID" ] } } },
					{ $project: { _id:0, content:0, } },
					{ $limit: _itemsPerPage },
					{ $sort: { postID: -1 } }
				],
				as: "posts"
			}
		}

		return query;
	},

	follows: () => {
		const query =	{
			$lookup: {
				from: mongoCFG.Medalbank.follows,
				let: { dbType: "$dbType", userID: "$userID" },
				pipeline: [
					{ $match: {
						$expr: {
								$and: [
									{ $eq: [ "$dbType", "$dbType" ] },
									{ $eq: [ "$dbID", "$userID" ] }
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
					{ $match: { $expr: { $eq: [ "$userID", "$userID" ] } } },
					{ $project: { _id:0, } },
				],
				as: "followedBys"
			}
		}

		return query;
	},

}
