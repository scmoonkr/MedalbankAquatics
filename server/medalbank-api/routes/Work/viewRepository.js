const mongoCFG 		= require('../Config/mongoCFG');

const groupID = {	
	ratings			: { $ifNull: [{ $avg: "$reactions.ratings"		}, 0] },
	likes				: { $ifNull: [{ $sum: "$reactions.likes"			}, 0] },
	dislikes		: { $ifNull: [{ $sum: "$reactions.dislikes"		}, 0] },
	blinds			: { $ifNull: [{ $sum: "$reactions.blinds"			}, 0] },
	shares			: { $ifNull: [{ $sum: "$reactions.shares"			}, 0] },
	pins				: { $ifNull: [{ $sum: "$reactions.pins"				}, 0] },
	views				: { $ifNull: [{ $sum: "$reactions.views"			}, 0] },
	captures		: { $ifNull: [{ $sum: "$reactions.captures"		}, 0] },
	follows		: { $ifNull: [{ $sum: "$reactions.follows"	}, 0] },
	followedBys	: { $ifNull: [{ $sum: "$reactions.followedBys"}, 0] },
}

//--------------------------------------
//	lookup
//--------------------------------------
const lookupReplies = {
	from: mongoCFG.Medalbank.replies,
	let: { dbType: "community", dbID: "$communityID" },
	pipeline: [
		{ $match: {
				$expr: {
					$and: [
						{ $eq: [ "$dbType", "community" ] },
						{ $eq: [ "$dbID", "$$dbID" ] },
					]
				}
			}
		}
	],
	as: "replies"
}
const lookupReactions = {
	from: mongoCFG.Medalbank.reactions,
	let: { dbType: "community", dbID: "$communityID" },
	pipeline: [
		{ $match: {
				$expr: {
					$and: [
						{ $eq: [ "$dbType", "community" ] },
						{ $eq: [ "$dbID", "$$dbID" ] },
					]
				}
			}
		}
	],
	as: "reactions",
}
const lookupCompetitions = {
	from				: mongoCFG.Medalbank.competitions,
	localField	: "competitionID",
	foreignField: "competitionID",
	as					: "competitions"  
}

//--------------------------------------
//	project
//--------------------------------------
const projectTimes = {
	timeID:1,
	masters:1,
	adult:1,
	individual:1,
	ageGroup:1,
	gender:1,
	style:1,
	course:1,
	distance:1,
	round:1,
	name:1,
	times:1,
	team:1,
	teamID:1,
	province:1,
	status:1,
	names:1,
	datetime:1,
	age:1,
	athleteID:1,
	competitionID:1,
	note:1,
	top:1,
	bestRank:1,
	heat:1,
	heatNo:1,
	lane:1,
	time:1,

	year:1,
	nameHide:1,
	rank:1,
	timeDiffs:1,
	pool:1,

	conscent:1,
}
const projectCompetitions = {
	_id:0, 
	competitionID:1,
	stem:1,
	stemID:1,
	name:1,
	fullname:1,
	year:1,
	order:1,
	hosts:1,
	managers:1,
	supporters:1,
	sponsers:1,
	pool:1,
	sido:1,
	address:1,
	email:1,
	website:1,
	phone:1,
	dateStart:1,
	dateEnd:1,
	dateStartSignup:1,
	dateEndSignup:1,
	dateStartReceipt:1,
	dateEndReceipt:1,
	ageGroup:1,
	styles:1,
	course:1,
	measured:1,
	grade:1,
	entryLimits:1,
	target:1,
	tags:1,
	featuredImage:1,
	outlines:1,
	timesFile:1,
	timesExcel:1,
	images:1,
	note:1,
	indexes:1,
	masters:1,
	priority:1,
	info:1,
}
const projectPools = {
	_id:0,
	poolID:1,
	check:1,
	name:1,
	poolname:1,
	fullname:1,
	nickname:1,
	sido:1,
	address:1,
	addressDRM:1,
	addressDetails:1,
	phone:1,
	email:1,
	website:1,
	length:1,
	lengthUnit:1,
	lanes:1,
	depthShallowEnd:1,
	depthDeepEnd:1,
	depthUnit:1,
	coordinateX:1,
	coordinateY:1,
	searchKeywords:1,
	notes:1,	
}
const projectTeams = {
	_id:0,
	teamID:1,
	year:1,
	status:1,
	isVerified:1,
	teamCode:1,
	teamClass:1,
	name:1,
	nameEnglish:1,
	fullname:1,
	names:1,
	representatives:1,
	coaches:1,
	sponsers:1,
	email:1,
	phone:1,
	city:1,
	pools:1,
	logo:1,
	tags:1,
	website:1,
	instagram:1,
	twitter:1,
	datetime:1,	
}
const projectActivities = {
  activityID:1,
  userID:1,
  title:1,
  content:1,
  category:1,
  tags:1,
  poolID:1,
  poolLength:1,
  competitionID:1,
  teamID:1,
  style:1,
  distance:1,
  time:1,
  times:1,
  ageGroup:1,
  rank:1,
  coaches:1,
  datetime:1,
  started:1,
  ended:1,
  reactionTime:1,
  reactionTimes:1,
  speedAverage:1,
  strokes:1,
  breathes:1,
  splits:1,
  status:1,
  veriffied:1,
}

exports.VIEW = {

	personalBestView() {
		const aggregate = [
			{ $lookup: lookupCompetitions },
			{ $project: {
					...projectTimes,
					competitions:{ $arrayElemAt: [ "$competitions", 0 ] },
				}
			},
			{ $project: {
					...projectTimes,
					pool: "$competitions.pool",
					competitionName: "$competitions.fullname",
				}
			},
		];

		return aggregate;
	},
	// rankingsView() {
	// 	const aggregate = [
	// 		{ $lookup: lookupCompetitions },
	// 		{ $project: {
	// 				...projectTimes,
	// 				competitions:{ $arrayElemAt: [ "$competitions", 0 ] },
	// 			}
	// 		},
	// 		{ $project: {
	// 				...projectTimes,
	// 				competitionName: "$competitions.fullname",
	// 				poolID: "$competitions.poolID",
	// 				pool: "$competitions.pool",
	// 				sido: "$competitions.sido",
	// 			}
	// 		},
	// 	];

	// 	return aggregate;
	// },

	// timesView() {
	// 	const aggregate = [
	// 		{ $lookup: lookupCompetitions },
	// 		{ $project: {
	// 				...projectTimes,
	// 				competitions:{ $arrayElemAt: [ "$competitions", 0 ] },
	// 			}
	// 		},
	// 		{ $project: {
	// 				...projectTimes,
	// 				sido: "$competitions.sido",
	// 				pool: "$competitions.pool",
	// 				poolID: "$competitions.poolID",
	// 				competitionName: "$competitions.fullname",
	// 			}
	// 		},
	// 	];

	// 	return aggregate;
	// },

	communitiesView() {
		const aggregate = [
			{ $lookup: lookupReplies },
			{ $lookup: lookupReactions },
			{ $group: {
					_id: { 
						communityID : "$communityID",
						...groupID
					},
					communityID			: { $first: "$communityID" },
					title						: { $first: "$title" },
					excerpt					: { $first: "$excerpt" },
					content					: { $first: "$content" },
					category				: { $first: "$category" },
					categories			: { $first: "$categories" },
					featured				: { $first: "$featured" },
					nickname				: { $first: "$nickname" },
					userNo					: { $first: "$userNo" },
					tags						: { $first: "$tags" },
					datetime				: { $first: "$datetime" },
					updated					: { $first: "$updated" },

					// myReactions			: { $first: "$myReactions" },
					replies					: { $first: "$replies" }
				}
			},
			{ $sort: { category: 1, datetime: -1 } },
			{ $limit: 2000 },
			{ $skip: 0 },
			{ $project: {
					communityID: 1,
					status: 1,
					title: 1,
					excerpt: 1,
					content: 1,
					category: 1,
					categories: 1,
					tags: 1,
					featured: 1,
					nickname: 1,
					userNo: 1,
					datetime: 1,
					updated: 1,
					// myReactions: 1,
					reactions: "$_id",
					_id: 0,
					replyCount: { "$size": "$replies" },
					replies: 1
				}
			}
		]
		return aggregate;
	},
	communitiesListView() {
		const aggregate = [
			{ $lookup: lookupReplies },
			{ $lookup: lookupReactions },
			{ $group: {
					_id: { 
						communityID : "$communityID",
						...groupID
					},
					communityID			: { $first: "$communityID" },
					title						: { $first: "$title" },
					excerpt					: { $first: "$excerpt" },
					content					: { $first: "$content" },
					category				: { $first: "$category" },
					categories			: { $first: "$categories" },
					featured				: { $first: "$featured" },
					nickname				: { $first: "$nickname" },
					userNo					: { $first: "$userNo" },
					tags						: { $first: "$tags" },
					datetime				: { $first: "$datetime" },
					updated					: { $first: "$updated" },

					// myReactions			: { $first: "$myReactions" },
					replies					: { $first: "$replies" }
				}
			},
			{ $sort: { category: 1, datetime: -1 } },
			{ $limit: 2000 },
			{ $skip: 0 },
			{ $project: {
					communityID: 1,
					status: 1,
					title: 1,
					excerpt: 1,
					content: 1,
					category: 1,
					categories: 1,
					tags: 1,
					featured: 1,
					nickname: 1,
					userNo: 1,
					datetime: 1,
					updated: 1,
					// myReactions: 1,
					reactions: "$_id",
					_id: 0,
					replyCount: { "$size": "$replies" },
					// replies: 1
				}
			}
		]
		return aggregate;
	},

	repliesView() {
		const aggregate = [
			{ $lookup: lookupReactions },
			{ $group: {
					_id: { 
						replyID 		: "$replyID",
						...groupID
					},
					replyID					: { $first: "$replyID" },
					title						: { $first: "$title" },
					excerpt					: { $first: "$excerpt" },
					content					: { $first: "$content" },
					category				: { $first: "$category" },
					categories			: { $first: "$categories" },
					featured				: { $first: "$featured" },
					nickname				: { $first: "$nickname" },
					userNo					: { $first: "$userNo" },
					tags						: { $first: "$tags" },
					datetime				: { $first: "$datetime" },
					updated					: { $first: "$updated" },
				}
			},
			{ $sort: { category: 1, datetime: -1 } },
			{ $limit: 2000 },
			{ $skip: 0 },
			{ $project: {
					_id: 0,
					replyID: 1,
					status: 1,
					title: 1,
					excerpt: 1,
					content: 1,
					category: 1,
					categories: 1,
					tags: 1,
					featured: 1,
					nickname: 1,
					userNo: 1,
					datetime: 1,
					updated: 1,
					reactions: "$_id",
				}
			}
		]
		return aggregate;
	},

	athletesView() {
		const aggregate = [
			{ $lookup: {
					from: mongoCFG.Medalbank.times,
					localField: "athleteID",
					foreignField: "athleteID",
					as: "times",
				}
			},
			{ $lookup: {
				from: mongoCFG.Medalbank.athletesInfo,
				localField: "athleteID",
				foreignField: "athleteID",
				as: "extraInfo",
				}
			},
			{ $project: {
				_id:0,
				athleteID:1,
				name:1,
				masters:1,
				adult:1,
				gender:1,
				dob:1,
				sido:1,
				note:1,
				
				nickname:1,
				dobTo:1,
				individual:1,
				nameComp:1,
				team:1,
				teamID:1,
				avatar:1,
				images:1,
				tags:1,
				datetime:1,
				
				nameHide:1,
				times:1,
				// extraInfo:1,
	
				conscent:1,
				
				timeCount: { "$size": "$times" },
				extraInfo: { $arrayElemAt: [ "$extraInfo", 0 ] }
			 }
			}
		]
		return aggregate;
	},
	athletesListView1() {
		const aggregate = [
			{ $lookup: {
					from: "athletesInfo",
					localField: "athleteID",
					foreignField: "athleteID",
					as: "extraInfo",
				}
			},
			{ $project: {
					_id:0,
					athleteID:1,
					name:1,
					masters:1,
					adult:1,
					gender:1,
					dob:1,
					sido:1,
					note:1,
					
					nickname:1,
					dobTo:1,
					individual:1,
					nameComp:1,
					team:1,
					teamID:1,
					avatar:1,
					images:1,
					tags:1,
					datetime:1,
					
					nameHide:1,
					times:1,
	
					conscent:1,
					
					timeCount: { "$size": "$times" },
					extraInfo: { $arrayElemAt: [ "$extraInfo", 0 ] }
				}
			},
			// { $project: { _id:0, masters:1, individual:1, adult:1, gender:1, ageGroup:1, name:1, names:1, nameHide:1, team:1, teamID:1, nameComp:1, times:1, extraInfo: { $arrayElemAt: [ "$extraInfo", 0 ] }} },
		]
		return aggregate;
	},
	athletesListView() {
		const aggregate = [
			{ $lookup: {
				from: mongoCFG.Medalbank.athletesInfo,
				localField: "athleteID",
				foreignField: "athleteID",
				as: "times",
				}
			},
			{ $project: {
					_id:0,
					athleteID:1,
					name:1,
					masters:1,
					adult:1,
					gender:1,
					dob:1,
					sido:1,
					note:1,
							
					nickname:1,
					dobTo:1,
					individual:1,
					nameComp:1,
					team:1,
					teamID:1,
					avatar:1,
					images:1,
					tags:1,
					datetime:1,
					extraInfo: { $arrayElemAt: [ "$extraInfo", 0 ] }
				}
			},
			{ $project: {
					_id:0,
					athleteID:1,
					name:1,
					masters:1,
					adult:1,
					gender:1,
					dob:1,
					sido:1,
					note:1,
							
					nickname:1,
					dobTo:1,
					individual:1,
					nameComp:1,
					team:1,
					teamID:1,
					avatar:1,
					images:1,
					tags:1,
					datetime:1,
					majorStyle: "$extraInfo.majorStyle",
					timeCount: "$extraInfo.timeCount",
					majorTimes: "$extraInfo.majorTimes",
					firstDate: "$extraInfo.firstDate",
					latestDate: "$extraInfo.latestDate",
					latestTimes: "$extraInfo.latestTimes"
				}
			}
		]
		return aggregate;
	},	
	
	competitionsView() {
		const aggregate = [
			{ $lookup: {
					from: "competitionsInfo",
					localField: "competitionID",
					foreignField: "competitionID",
					as: "extraInfo",
				}
			},
			{ $project: {
				...projectCompetitions,			
					extraInfo: { $arrayElemAt: [ "$extraInfo", 0 ] } }
			},
			{ $project: { 
					...projectCompetitions,			
					extraInfo: "$extraInfo.extraInfo",
				}
			},		
		]
		return aggregate;
	},
	
	poolsView() {
		const aggregate = [
			{ $lookup: {
					from: "poolsInfo",
					localField: "poolID",
					foreignField: "poolID",
					as: "extraInfo",
				}
			},
			{ $project: {
				...projectPools,			
					extraInfo: { $arrayElemAt: [ "$extraInfo", 0 ] } }
			},
			{ $project: { 
					...projectPools,			
					extraInfo: "$extraInfo.extraInfo",
				}
			},		
		]
		return aggregate;
	},
	
	teamsView() {
		const aggregate = [
			{ $lookup: {
					from: "teamsInfo",
					localField: "teamID",
					foreignField: "teamID",
					as: "extraInfo",
				}
			},
			{ $project: {
				...projectTeams,			
					extraInfo: { $arrayElemAt: [ "$extraInfo", 0 ] } }
			},
			// { $project: { 
			// 		...projectTeams,			
			// 		extraInfo: "$extraInfo.extraInfo",
			// 	}
			// },		
		]
		return aggregate;
	},
	
	activitiesView() {
		const aggregate = [
			{ $lookup: {
					from: "users",
					localField: "userID",
					foreignField: "userID",
					as: "users",
				}
			},
			{ $project: {
        ...projectActivities,
        user: { $arrayElemAt: [ "$user", 0 ] } }
			},
			// { $project: { 
			// 		...projectActivities,			
			// 		extraInfo: "$extraInfo.extraInfo",
			// 	}
			// },		
		]
		return aggregate;
	},

}

