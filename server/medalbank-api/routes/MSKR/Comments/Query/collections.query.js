const mongoCFG  	= require('../../Config/mongoCFG');
const {CommonQuery}      = require("./common.query");

const dbType = "post";
const post_id = `$${dbType}ID`;  // postID, postID, ...

//-------------------------------------
exports.collectionsList = (match, body) => { // dbType: 'post', dbID: 1
	const limit = body.limit ? Number(body.limit) : 10;
	const skip = body.page ? Number(body.page) * limit : 0;
	// skip = (skip > 0 ? skip-1 : 0) * limit;
	console.log("collectionsList: match", match, ", body:", body, ", limit:", limit, ", skip:", skip);

	const countComments = {
		$lookup: {
				from: mongoCFG.Medalbank.comments,
				let: { post_id: "$postID" },
				pipeline: [
					{ $match: {
							$expr: {
								$and: [
									{ $eq: ["$dbType", dbType] },
									{ $eq: ["$dbID", "$$post_id"] }
								]
							}
						}
					},
					{ $count: "commentCount" }
				],
				as: "commentData"
		}
	};

	const lookupReactions = {
		$lookup: {
				from: mongoCFG.Medalbank.reactions,
				let: { post_id: "$postID" },
				pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$post_id"] }
									]
								}
							}
						},
						{ $group: {
								// _id: "$dbID",
                _id: { dbType: "$dbType", dbID: "$dbID" },
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "reactionData"
		}
	};

	const lookupMyReactions = {
		$lookup: {
				from: mongoCFG.Medalbank.reactions,
				let: { post_id: "$postID", user_id: Number(body.userID) },
				pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$post_id"] },
										{ $eq: ["$userID", "$$user_id"] }
									]
								}
							}
						},
						{ $group: {
								// _id: "$userID",
                _id: { dbType: "$dbType", dbID: "$dbID" },
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "myReactionData"
		}
	};
	
	const aggregate = [];
	aggregate.push({ $match: match });
	aggregate.push({ $limit: limit+skip });
	aggregate.push({ $skip: skip });
	aggregate.push({ $project: { content:0 } });
	aggregate.push(countComments);
	aggregate.push({ $unwind: { path: "$commentData", preserveNullAndEmptyArrays: true } });
	aggregate.push(lookupReactions);
	aggregate.push({ $unwind: { path: "$reactionData", preserveNullAndEmptyArrays: true } });
	if (body.userID && !isNaN(body.userID)) aggregate.push(lookupMyReactions);
	aggregate.push({ $unwind: { path: "$myReactionData", preserveNullAndEmptyArrays: true } });
	aggregate.push(
		{ $addFields: {
				commentCount: "$commentData.commentCount",
				reactions   : "$reactionData",
				myReactions : "$myReactionData"
			}
		}
	);
	aggregate.push(
		{ $project: {
				commentData   : 0,
				reactionData  : 0,
				myReactionData: 0
			}
		}
	);
	// console.log(JSON.stringify(aggregate, null, '  '));

	return aggregate;
}
//-------------------------------------
//-------------------------------------
exports.collectionsDetail = (match, userID) => { // dbType: 'post', dbID: 1

	const countComments = {
		$lookup: {
				from      : mongoCFG.Medalbank.comments,
				let       : { post_id: '$postID' },
				pipeline  : [
					{ $match: {
							$expr: {
								$and: [
									{ $eq: ["$dbType", dbType] },
									{ $eq: ["$dbID", "$$post_id"] }
								]
							}
						}
					},
					{ $count: "commentCount" }
				],
				as: "commentData"
		}
	};

	const lookupReactions = {
		$lookup: {
				from    : mongoCFG.Medalbank.reactions,
				let     : { post_id: '$postID' },
				pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$post_id"] }
									]
								}
							}
						},
						{ $group: {
								// _id: "$dbID",
                _id: { dbType: "$dbType", dbID: "$dbID" },
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "reactionData"
		}
	};

	const lookupMyReactions = {
		$lookup: {
				from    : mongoCFG.Medalbank.reactions,
				let     : { post_id: '$postID', user_id: Number(userID) },
				pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$post_id"] },
										{ $eq: ["$userID", "$$user_id"] }
									]
								}
							}
						},
						{ $group: {
								// _id: "$userID",
                _id: { dbType: "$dbType", dbID: "$dbID" },
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "myReactionData"
		}
	};
	
	const aggregate = [];
	aggregate.push({ $match: match });
	aggregate.push(countComments);
	aggregate.push({ $unwind: { path: "$commentData", preserveNullAndEmptyArrays: true } });
	aggregate.push(lookupReactions);
	aggregate.push({ $unwind: { path: "$reactionData", preserveNullAndEmptyArrays: true } });
	if (userID && !isNaN(userID)) aggregate.push(lookupMyReactions);
	aggregate.push({ $unwind: { path: "$myReactionData", preserveNullAndEmptyArrays: true } });
	aggregate.push(
		{ $addFields: {
				commentCount: "$commentData.commentCount",
				reactions   : "$reactionData",
				myReactions : "$myReactionData"
			}
		}
	);
	aggregate.push(
		{ $project: {
				commentData   : 0,
				reactionData  : 0,
				myReactionData: 0
			}
		}
	);


	return aggregate;
}
//-------------------------------------

//-------------------------------------
exports.collectionsListOld = (match, userID) => { // dbType: 'post', dbID: 1

	const countComments = {
		$lookup: {
				from: mongoCFG.Medalbank.comments,
				let: { post_id: post_id },
				pipeline: [
					{ $match: {
							$expr: {
								$and: [
									{ $eq: ["$dbType", dbType] },
									{ $eq: ["$dbID", "$$post_id"] }
								]
							}
						}
					},
					{ $count: "commentCount" }
				],
				as: "commentData"
		}
	};

	const lookupReactions = {
		$lookup: {
				from: mongoCFG.Medalbank.reactions,
				let: { post_id: post_id },
				pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$post_id"] }
									]
								}
							}
						},
						{ $group: {
								// _id: "$dbID",
                _id: { dbType: "$dbType", dbID: "$dbID" },
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "reactionData"
		}
	};

	const lookupMyReactions = {
		$lookup: {
				from: mongoCFG.Medalbank.reactions,
				let: { post_id: post_id, user_id: Number(userID) },
				pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$post_id"] },
										{ $eq: ["$userID", "$$user_id"] }
									]
								}
							}
						},
						{ $group: {
								// _id: "$userID",
                _id: { dbType: "$dbType", dbID: "$dbID" },
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "myReactionData"
		}
	};
	
	const aggregate = [];
	aggregate.push({ $match: match });
	aggregate.push({ $project: { content:0 } });
	aggregate.push(countComments);
	aggregate.push({ $unwind: { path: "$commentData", preserveNullAndEmptyArrays: true } });
	aggregate.push(lookupReactions);
	aggregate.push({ $unwind: { path: "$reactionData", preserveNullAndEmptyArrays: true } });
	if (userID && !isNaN(userID)) aggregate.push(lookupMyReactions);
	aggregate.push({ $unwind: { path: "$myReactionData", preserveNullAndEmptyArrays: true } });
	aggregate.push(
		{ $addFields: {
				commentCount: "$commentData.commentCount",
				reactions   : "$reactionData",
				myReactions : "$myReactionData"
			}
		}
	);
	aggregate.push(
		{ $project: {
				commentData   : 0,
				reactionData  : 0,
				myReactionData: 0
			}
		}
	);

	return aggregate;
}
//-------------------------------------
//-------------------------------------
exports.collectionsDetailOld = (match, userID) => { // dbType: 'post', dbID: 1

	const countComments = {
		$lookup: {
				from      : mongoCFG.Medalbank.comments,
				let       : { post_id: post_id },
				pipeline  : [
					{ $match: {
							$expr: {
								$and: [
									{ $eq: ["$dbType", dbType] },
									{ $eq: ["$dbID", "$$post_id"] }
								]
							}
						}
					},
					{ $count: "commentCount" }
				],
				as: "commentData"
		}
	};

	const lookupReactions = {
		$lookup: {
				from    : mongoCFG.Medalbank.reactions,
				let     : { post_id: post_id },
				pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$post_id"] }
									]
								}
							}
						},
						{ $group: {
								// _id: "$dbID",
                _id: { dbType: "$dbType", dbID: "$dbID" },
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "reactionData"
		}
	};

	const lookupMyReactions = {
		$lookup: {
				from    : mongoCFG.Medalbank.reactions,
				let     : { post_id: post_id, user_id: Number(userID) },
				pipeline: [
						{ $match: {
								$expr: {
									$and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$post_id"] },
										{ $eq: ["$userID", "$$user_id"] }
									]
								}
							}
						},
						{ $group: {
								// _id: "$userID",
                _id: { dbType: "$dbType", dbID: "$dbID" },
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "myReactionData"
		}
	};
	
	const aggregate = [];
	aggregate.push({ $match: match });
	aggregate.push(countComments);
	aggregate.push({ $unwind: { path: "$commentData", preserveNullAndEmptyArrays: true } });
	aggregate.push(lookupReactions);
	aggregate.push({ $unwind: { path: "$reactionData", preserveNullAndEmptyArrays: true } });
	if (userID && !isNaN(userID)) aggregate.push(lookupMyReactions);
	aggregate.push({ $unwind: { path: "$myReactionData", preserveNullAndEmptyArrays: true } });
	aggregate.push(
		{ $addFields: {
				commentCount: "$commentData.commentCount",
				reactions   : "$reactionData",
				myReactions : "$myReactionData"
			}
		}
	);
	aggregate.push(
		{ $project: {
				commentData   : 0,
				reactionData  : 0,
				myReactionData: 0
			}
		}
	);


	return aggregate;
}
//-------------------------------------
