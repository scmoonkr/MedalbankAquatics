const mongoCFG  	= require('../../Config/mongoCFG');
const {CommonQuery}      = require("./common.query");

const dbType = "comment";
const max_limit = 200;
//-------------------------------------
exports.list = (dbType, match, userID, sort={ commentID: -1}, skip=0, limit=max_limit) => { // dbType: 'community', dbID: 1
	userID = Number(userID);
	const countComments = {
		$lookup: {
			from: mongoCFG.Medalbank.replies,
			let: { dbID: "$commentID" },
			pipeline: [
					{ $match:
							{ $expr:
								{ $and: [
									{ $eq: ["$dbType", dbType] },
									{ $eq: ["$dbID", "$$dbID"] }
								]
							}
						}
					},
					{ $count: "replyCount" }
			],
			as: "replyData"
		}
	};

	const lookupReactions = {
		$lookup: {
				from: mongoCFG.Medalbank.reactions,
				let: { dbID: "$commentID" },
				pipeline: [
						{ $match:
								{ $expr:
									{ $and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$dbID"] }
									]
								}
							}
						},
						{ $group: {
								_id: null,
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
				let: { dbID: "$commentID", userID: userID },
				pipeline: [
						{ $match:
								{ $expr:
									{ $and: [
										{ $eq: ["$dbType", dbType] },
										{ $eq: ["$dbID", "$$dbID"] },
										{ $eq: ["$userID", "$$userID"] }
									]
								}
							}
						},
						{ $group: {
								_id: null,
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
	aggregate.push({ $unwind: { path: "$replyData", preserveNullAndEmptyArrays: true } });
	aggregate.push(lookupReactions);
	aggregate.push({ $unwind: { path: "$reactionData", preserveNullAndEmptyArrays: true } });
	if (userID || !isNaN(userID)) aggregate.push(lookupMyReactions);
	aggregate.push({ $unwind: { path: "$myReactionData", preserveNullAndEmptyArrays: true } });
	aggregate.push({ $addFields: {
			replyCount: "$replyData.replyCount",
			reactions: "$reactionData",
			myReactions: "$myReactionData"
		}
	});
	aggregate.push({ $project: {
			replyData: 0,
			reactionData: 0,
			myReactionData: 0
		}
	});

	return aggregate;
}
//-------------------------------------

//-------------------------------------
exports.detailBySocialMediaID = (body) => {
	const sort 			= body.sort		|| { commentID: 1 };
	const skip 			= body.skip		? Number(body.skip) : 0;
	const limit 		= body.limit	? Number(body.limit) : max_limit;
	const dbType  	= body.dbType	|| "comment";
	const commentID	= Number(body.dbID);
	const userID  	= Number(body.userID);
console.log("body=", body);

	const lookupMyReactions = {
		$lookup: {
				from: mongoCFG.Medalbank.socialReactions,
				let: { dbType: dbType, dbId: "$commentID", userId: userID }, // 여기서 사용자 ID 지정
				pipeline: [
						{ $match:
							{ $expr:
								{ $and: [
										{ $eq: ["$dbType", "$$dbType"] },
										{ $eq: ["$dbID", "$$dbId"] },
										{ $eq: ["$userID", "$$userId"] }
									]
								}
							} 
						},
						{ $group: {
								_id: null,
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "myReactions"
		}
	};  

	const lookupReactions = {
		$lookup: {
			from: mongoCFG.Medalbank.socialReactions,
			let: { dbType: dbType, dbId: "$commentID" }, // 여기서 사용자 ID 지정
			pipeline: [
					{ $match:
						{ $expr:
							{ $and: [
									{ $eq: ["$dbType", "$$dbType"] },
									{ $eq: ["$dbID", "$$dbId"] }
								]
							}
						} 
					},
					{ $group: {
						_id: null,
						...CommonQuery.groupReactions,
					}
				}
			],
			as: "reactions"
		}
	};

	const aggregate =[
		{ $match: { rootCID: commentID } },
		lookupReactions,
		lookupMyReactions,
		{ $sort: sort },
		{ $skip: skip },
		{ $limit: limit },
	]

	return aggregate;
}
//-------------------------------------

//-------------------------------------
exports.detail = (body) => {  // dbType: 'community', dbID: 1
	console.log("body=",body);
	
	const sort 			= body.sort		|| { commentID: 1 };
	const skip 			= body.skip		? Number(body.skip) : 0;
	const limit 		= body.limit	? Number(body.limit) : max_limit;

	const userID = Number(body.userID || 0);
	const dbType = body.dbType
	const dbID = Number(body.dbID);

	const lookupReplies = {
		$lookup: {
			from: mongoCFG.Medalbank.replies,
			localField: "commentID",
			foreignField: "commentID",
			as: "replies"
		}
	};

	const lookupRepliesReactions = {
		$lookup: {
			from: mongoCFG.Medalbank.socialReactions,
			let: { dbType: body.dbType, replyId: "$replies.replyID" }, // 여기서 사용자 ID 지정
			pipeline: [
					{ $match:
						{ $expr:
							{ $and: [
									{ $eq: ["$dbType", "$$dbType"] },
									{ $eq: ["$dbID", "$$replyId"] }
								]
							}
						} 
					},
					{ $group: {
						_id: null,
						...CommonQuery.groupReactions,
					}
				}
			],
			as: "replies.reactions"
		}
	};

	const lookupRepliesMyReactions = {
		$lookup: {
				from: mongoCFG.Medalbank.socialReactions,
				let: { dbType: body.dbType, replyId: "$replies.replyID", userId: userID }, // 여기서 사용자 ID 지정
				pipeline: [
						{ $match:
							{ $expr:
								{ $and: [
										{ $eq: ["$dbType", "$$dbType"] },
										{ $eq: ["$dbID", "$$replyId"] },
										{ $eq: ["$userID", "$$userId"] }
									]
								}
							} 
						},
						{ $group: {
								_id: null,
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "replies.myReactions"
		}
	};  

	const lookupMyReactions = {
		$lookup: {
				from: mongoCFG.Medalbank.socialReactions,
				let: { commentId: "$commentID", userId: userID }, // 여기서 사용자 ID 지정
				pipeline: [
						{ $match:
							{ $expr:
								{ $and: [
										{ $eq: ["$dbType", "comment"] },
										{ $eq: ["$dbID", "$$commentId"] },
										{ $eq: ["$userID", "$$userId"] }
									]
								}
							} 
						},
						{ $group: {
								_id: null,
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "myReactions"
		}
	};  

	const lookupReactions = {
		$lookup: {
			from: mongoCFG.Medalbank.socialReactions,
			let: { commentId: "$commentID" }, // 여기서 사용자 ID 지정
			pipeline: [
					{ $match:
						{ $expr:
							{ $and: [
									{ $eq: ["$dbType", "comment"] },
									{ $eq: ["$dbID", "$$commentId"] }
								]
							}
						} 
					},
					{ $group: {
						_id: null,
						...CommonQuery.groupReactions,
					}
				}
			],
			as: "reactions"
		}
	};

	const aggregate = [];
	//---------------------------------
	aggregate.push({ $match: { dbType: dbType, dbID: dbID } });
	aggregate.push(lookupReplies);
	aggregate.push({ $unwind: { path: "$replies", preserveNullAndEmptyArrays: true } });
		
	aggregate.push(lookupRepliesReactions);
	if (userID || !isNaN(userID)) aggregate.push(lookupRepliesMyReactions);

	aggregate.push({ $group: {
			_id: "$_id",
			data: { $first: "$$ROOT" },
			replies: { $push: "$replies" }
		}
	});
	aggregate.push({ $addFields: { "data.replies": "$replies" } });
	aggregate.push({ $replaceRoot: { newRoot: "$data" } });
		
	if (userID || !isNaN(userID)) aggregate.push(lookupMyReactions);
	aggregate.push(lookupReactions);
	aggregate.push({ $sort: sort });
	aggregate.push({ $skip: skip });
	aggregate.push({ $limit: limit });
	//---------------------------------
	
// console.log(JSON.stringify(aggregate, null, '  '));

	return aggregate;
}
//-------------------------------------

//-------------------------------------
exports.listNew = () => {

}
//-------------------------------------
exports.detailNew = (match, body) => {
	const sort 			= body.sort		|| { commentID: 1 };
	const skip 			= body.skip		? Number(body.skip) : 0;
	const limit 		= body.limit	? Number(body.limit) : max_limit;
	const dbType  	= body.dbType	|| "comment";
	const userID  	= Number(body.userID);
console.log("match:", match, ", body:", body);

	const lookupMyReactions = {
		$lookup: {
				from: mongoCFG.Medalbank.socialReactions,
				let: { dbType: dbType, dbId: "$commentID", userId: userID }, // 여기서 사용자 ID 지정
				pipeline: [
						{ $match:
							{ $expr:
								{ $and: [
										{ $eq: ["$dbType", "$$dbType"] },
										{ $eq: ["$dbID", "$$dbId"] },
										{ $eq: ["$userID", "$$userId"] }
									]
								}
							} 
						},
						{ $group: {
								_id: null,
								...CommonQuery.groupReactions,
							}
						}
				],
				as: "myReactions"
		}
	};  

	const lookupReactions = {
		$lookup: {
			from: mongoCFG.Medalbank.socialReactions,
			let: { dbType: dbType, dbId: "$commentID" }, // 여기서 사용자 ID 지정
			pipeline: [
					{ $match:
						{ $expr:
							{ $and: [
									{ $eq: ["$dbType", "$$dbType"] },
									{ $eq: ["$dbID", "$$dbId"] }
								]
							}
						} 
					},
					{ $group: {
						_id: null,
						...CommonQuery.groupReactions,
					}
				}
			],
			as: "reactions"
		}
	};

	const aggregate =[
		{ $match: match },
		lookupReactions,
		lookupMyReactions,
		// { $sort: sort },
		// { $skip: skip },
		// { $limit: limit },
	]

	return aggregate;
}
//-------------------------------------