const _    			= require('lodash');
const extend 			= require('node.extend');
const {swimmingCFG}		= require('../../Config/swimmingCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate		= require("../../Class/DateLibrary");
const utilError		= require("../../Util/utilError");
const imageLibrary= require("../library/images.library.js");
const StaticLibrary	= require("../library/statistics.library");
const TimeLibrary = require('../../Class/TimeLibrary.js');
const MemoryDB		= require("../../Class/MemoryDB");
const memoryDB		= new MemoryDB();
const timeLibrary = new TimeLibrary();

const Customizing = require("./competitions.custom");
const { athlete } = require('../share/share.model.js');

const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const utilDate		= new UtilDate();

const PK = "competitionID";
const MAX_LIMIT = 200;

const _context = {
	query		 	: {},
	projection: { _id:0, },
	limit		 	: MAX_LIMIT,
	skip			: 0,
	sort			: { _id:-1 },
}


class CompetitionModel {

	
	static create = async () => {
		let indexes = [
			{ query: { competitionID:1 }, name: "competitionID", option: { unique: true }	},
			{ query: { "fullname":1 }, name: "fullname"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Medalbank.athletes, indexes);
	}
	static createView = async () => {
		let returnObj = { message: "", };
		try {
			const viewName = mongoCFG.Medalbank.competitionsView;
			const viewON = mongoCFG.Medalbank.competitions;
			const pipeline = [
				{ $lookup: {
						from				: mongoCFG.Medalbank.competitionsStatistics,
						localField	: "competitionID",
						foreignField: "competitionID",
						as					: "extraInfo"
					}
				}
			];

			result = await mongodb.dropCollection(viewName);
			result = await mongodb.createView(viewName, viewON, pipeline);
		} catch (e) {
			returnObj = { message: `createView catch. ${e}`, data: {} };
		}

		return returnObj;
	}
	
	// find competitions

	static async list(query, body={}) {
		const limit = body.limit ? Number(body.limit) : MAX_LIMIT;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		
		// if (body.year		) query.year = Number(body.year);
		// if (body.sido		) query.sido = body.sido;
		// if (body.course	) query.course = body.course;
		// if (body.masters) query.isMasters = body.masters == "비등록";
		// if (body.measured && (body.measured || body.measured == 'automatic')) query.measured = true;
		const sort = {};
		if (body.sortField) {
			sort[body.sortField] = body.sortDirection == 'asc' ? 1 : -1;
		} else sort.dateStart = -1;
		// console.log("competitions.list.body=", body, sort, "query=", query);

		const context = {
			query			: query,
			projection: { _id:0, },
			limit			: limit,
			skip			: skip,
			sort			: sort,
		}
		
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.competitions, context)
		const cids = result.data.map(el => el.competitionID);
		// console.log("competitions.list.query=", query, result.data);
		//----------------------------------------------------------------
		const aggregate = [
			{ $match: { competitionID: { $in: cids } } },
			{ $group: {
					_id: {
						competitionID: '$competitionID',
						name: '$name'
					}
				}
			},
			{ $group: {
					_id: '$_id.competitionID',
					athleteCount: { $sum: 1 }
				}
			},
		];
		//----------------------------------------------------------------
		const times = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate)
		// console.log(times.data.slice(0,10));
		//----------------------------------------------------------------

		result.data.forEach(competition => {
			competition.athleteCount = times.data.find(el => el._id == competition.competitionID)?.athleteCount ?? 0;
		})
		// console.log("query=", query, "count=", result.count, "length=", result.data.length, "data=", result.data.slice(0,10));
		return result;
	}

	/**
	 * view competition
	 * @param {*} body.competitionID
	 * @returns 
	 */
	static async viewNew(body) {
		console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++", body);
		/*
		const output = {
			extraInfo: {
				teamRank: [
					{ teamID, name, athleteCount, medals: 123 }
				],
				medalbankRank: [
					{ teamID, name, athleteCount, men, women, mixed, gold, silver, bronze, freestyle, ... }
				],
			},
			competitions: [
				{ dateStart, cmopetitionID, category, isAdult, fullname, athleteCount, pool }
			],
			seriesRecords:[
				{ gender, style, distance, name, timeID, time, datetime, competitionID, fullname },
			],
			records:[
				{ gender, style, distance, name, timeID, time, datetime, competitionID, fullname },
			],
			teams: [
				{ teamID, name, gold, silver, bronze, men, women, mixed, individual, team, athleteCount, timeCount, },
			],
			majorStyles: [
				{ gender, style, 25M, 50M, 100M, 200M, 400M, 800M, 1500M},
			],
			ageGroups: [
				{ ageGroup, count },
			],
		};
		*/
		//----------------------------------------------------------------
		const query = { competitionID: Number(body.competitionID) };
		const aggregate = [
			{ $match: query },
			{ $lookup: {
					from				: mongoCFG.Medalbank.times,
					localField	: "competitionID",
					foreignField: "competitionID",
					as					: "times"
				}
			},
			
			{ $project: { _id:0, athleteCount:0, bestTimes:0, styleDistances:0, timeCount:0, } },
		];
		//-----> select competitions
		const result = await mongodb.aggregate(mongoCFG.Medalbank.competitions, aggregate);
		
		if (result.data.length == 0) return {	message: "no data", data: {} };
		const data = result.data[0];

		result.data[0].times = timeLibrary.setTimesAthleteIDTeamID(data.times);

		const competition = {
			competitionID		: data.competitionID,
			fullname				: data.fullname ?? "",
			sido						: data.sido ?? "",
			dateStart				: data.dateStart ? new Date(data.dateStart).toISOString().slice(0, 10) : "",
			pool						: data.pool ?? "",
			course					: data.course ?? "",
			isMasters				: data.isMasters ?? true,
			featured				: data.featured ?? "",
			featuredBB			: data.featuredBB ?? "",
			poolID					: data.poolID ?? 0,
			stemID					: data.stemID ?? 0,
			competitionType	: data.competitionType ?? '',
			teamRank				: data.teamRank ?? [],
			stem						: data.stem ?? "",
			athleteCount		: 0,
			timeCount				: 0,
			extraInfo				: {
				competitions	: data.times, // 이번대회 times
				styleDistances: [],
				medals				: {},
				teams					: [],
				ageGroups			: [],
				bestTimes			: [],
				bestStems			: await this.getStemsTop1(data.stemID) ?? [], // // stems best
			},
		};
		if (competition.featuredBB) competition.featured = competition.featuredBB;

		//-------------------------------------------------------------------------
		// series 대회
		//-------------------------------------------------------------------------
		if (data.stemID) {
			// find stemID
			const context = {
				query			: { stemID: data.stemID },
				projection: { _id:0, competitionID:1, fullname:1, dateStart:1 },
				limit			: 10000,
				skip			: 0,
				sort			: { dateStart: -1 },
			}
			const resultStems = await mongodb.find(mongoCFG.Medalbank.competitions, context);
			competition.extraInfo.competitions = resultStems.data.reduce((arr, competition) => {
																															// const comp = memoryDB.getCompetition(competition.competitionID);
																															// const value = {
																															// 	competitionID: competition.competitionID,
																															// 	fullname: comp.fullname,
																															// 	dateStart: comp.dateStart,
																															// };
																															competition.dateStart = competition.dateStart ? new Date(competition.dateStart).toISOString().slice(0, 10) : "";
																															arr.push(competition);
																															return arr;
																														}, []);
		}
	//-------------------------------------------------------------------------
		const extraInfo = {}; // await libraryCompetitionBuild.buildCompetitionStatistics(competition.competitionID, data.times);

		// console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~", data.times.length, competition.extraInfo);
		if (data.times.length == 0) {
			return { message: '', data: competition, compression: { pools:[], competitions: [], teams: [] }};
		}

		//-----------------------------------------------------------------
		const athleteIDs = [...new Set(data.times.filter(el => el.athleteID).map(entry => entry.athleteID))].sort((a,b) => a-b);
		if (competition.extraInfo.bestStems.length > 0) {
			competition.extraInfo.bestStems.forEach(el => {
				if (el.athleteID && !athleteIDs.includes(el.athleteID)) athleteIDs.push(el.athleteID);
			});
		}
		// console.log("athleteIDs=", athleteIDs);
		const context = {
			query			: { athleteID: { $in: athleteIDs } },
			projection: { _id:0, athleteID:1, thumbnail:1, },
			limit			: 1000,
			sort			: { athleteID:1, },	
		};
		const athletes = await mongodb.find(mongoCFG.Medalbank.athletes, context);
		// console.log("athletes=", athletes.data);
		data.times.forEach((time) => {
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
				time.thumbnail = athlete && athlete.thumbnail ? athlete.thumbnail : '';
				if (time.athleteID==1) {
					console.log(time.athleteID, time.thumbnail, athlete.thumbnail);
				}
			}
			if (time.datetime) time.datetime = new Date(time.datetime).toISOString().slice(0, 10)
		});

		competition.extraInfo.bestStems.forEach(time => {
			if (time.athleteID) {
				const athlete = athletes.data.find(athlete => athlete.athleteID == time.athleteID);
				time.thumbnail = athlete && athlete.thumbnail ? athlete.thumbnail : '';
				if (time.athleteID==1) {
					console.log(time.athleteID, time.thumbnail, athlete.thumbnail);
				}
			}
		});
		//-----------------------------------------------------------------
		
		competition.athleteCount	= [...new Set(data.times.map((item) => item.name))].length;
		competition.timeCount			= data.times.length;
		
		extraInfo.bestTimes				= timeLibrary.findBestTime(data.times, 1);

		// extraInfo.medals					= timeLibrary.countMedalsByStyleAndGender(times);
		extraInfo.styleDistances	= timeLibrary.getDistance4GenderStyle(data.times); // gender-style, 50M, 100M, 200M, ...
		extraInfo.ageGroups				= timeLibrary.getAgeGroupByCount(data.times);
		extraInfo.teamRank        = timeLibrary.getTeamsByCount(data.times);
		extraInfo.teams 					= timeLibrary.getTeamsMedalsPoints(data.times);	

		competition.extraInfo.styleDistances 	= extraInfo.styleDistances
		competition.extraInfo.medals 					= extraInfo.medals
		competition.extraInfo.teams 					= extraInfo.teams.sort((a,b) => b.athleteCount-a.athleteCount)
		// sort, rank 부여
		competition.extraInfo.ageGroups 			= extraInfo.ageGroups

		// bestTimes
		for (const best of extraInfo.bestTimes) {
			if (best.times.length > 0) {
				const comp = memoryDB.getCompetition(best.times[0].competitionID);
				const time = {
					timeID					: best.times[0].timeID,
					athleteID				: best.times[0].athleteID,
					ageGroup				: best.times[0].ageGroup,
					gender					: best.gender,
					style						: best.style,
					course					: best.course,
					distance				: best.distance,
					isMasters				: best.times[0].isMasters,
					name						: best.times[0].name,
					time						: best.times[0].time,
					thumbnail				: best.times[0].thumbnail ?? '',
					datetime				: comp.dateStart,
					// pool						: comp.pool ?? "",
					// competitionName	: comp.fullname ?? "",
					poolID					: comp.poolID,
					teamID					: comp.teamID,
					competitionID		: comp.competitionID,
				};
				if (time.datetime) time.datetime = new Date(time.datetime).toISOString().slice(0, 10)
				competition.extraInfo.bestTimes.push(time);
			}
		}

		
		// times에서 competition, pool, team name 분리하고 compression에 별도로 정리
		const { times:eventTimes, compression:eventcomp } 	= timeLibrary.getCompetitionsTeamsPools(competition.extraInfo.bestTimes);
		const { times:stemTimes, compression:stemComp } 		= timeLibrary.getCompetitionsTeamsPools(competition.extraInfo.bestStems);
		const { times:competitionTimes, compression:exceptComp } = timeLibrary.getCompetitionsTeamsPools(data.times);
		// console.log("competitionTimes=", competitionTimes.slice(0, 5));

		competition.extraInfo.competitionTimes 			= competitionTimes;
		competition.extraInfo.bestStems 	= stemTimes;
		competition.extraInfo.bestTimes 	= eventTimes;
		// console.log("eventTimes=", eventTimes.length, eventTimes.slice(0,5));
		
		// competition, pool, team name 분리하고 통합합
		competition.compression = {
			teams: [...new Map([
														...eventcomp.teams,
														...stemComp.teams,
														...exceptComp.teams
													].map(item => [item.teamID, item])
												).values()
							],
			pools: [...new Map([
														...eventcomp.pools,
														...stemComp.pools,
														...exceptComp.pools
													].map(item => [item.poolID, item])
												).values()
							],
			competitions: [...new Map([
														...eventcomp.competitions,
														...stemComp.competitions,
														...exceptComp.competitions
													].map(item => [item.competitionID, item])
												).values()
										],
		};
		// console.log("competitions=", competition.extraInfo.teams[0]);
		return { message: '', data: competition, };
		//----------------------------------------------------------------
	}

	// detail
	static async detail(body) {
		// console.log("competitions.detail.competitionID=", competitionID);
		//----------------------------------------------------------------
		const returnObj = await mongodb.findOne(mongoCFG.Medalbank.competitions, { competitionID: Number(body.competitionID) }, { _id:0,});
		returnObj.data = Customizing.field(returnObj.data);
		//----------------------------------------------------------------

		return returnObj;
	}

	// brief
	static async brief(body) {
		// console.log("competitions.detail.competitionID=", competitionID);
		//----------------------------------------------------------------
		const returnObj = await mongodb.findOne(
																			mongoCFG.Medalbank.competitions,
																			{ competitionID: Number(body.competitionID) },
																			{ _id:0, competitionID:1, fullname:1, poolID:1, pool:1, course:1, dateStart:1, }
																		);
		returnObj.data.dateStart = returnObj.data.dateStart ? new Date(returnObj.data.dateStart).toISOString().slice(0, 10) : "";
		if (!returnObj.data.competitionID) return { message: " data not found", data: {} };

		returnObj.data = Customizing.field(returnObj.data);
		//----------------------------------------------------------------

		return returnObj;
	}
  	

	//=================================================
	static getStemsTop1 = async (stemID) => {
		let aggregate = [
			// 0. query
			{ $match: {
					stemID: Number(stemID),
					style: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"] },
					timeStamp: { $gt: 0 },
					// isAdult: true,
					// isMasters: true,
					fin: { $exists: false },
					$or: [ { status: { $exists: false } },{ status: "" }, ],
				}
			},
			
			// Step 1: Sort the entire collection by timeStamp in ascending order.
			{ 
				$sort: { timeStamp: 1 } 
			},
			// Step 2: Group documents.
			{
				$group: {
					_id: {
						gender	: "$gender",
						style		: "$style",
						course	: "$course",
						distance: "$distance"
					},
					athleteSet: { $addToSet: "$athleteID" },  // unique athletes
					timeCount	: { $sum: 1 },                   // total record count
					times: {
						$push: {
							timeID				: "$timeID",
							name					: "$name",
							time					: "$time",
							ageGroup			: "$ageGroup",
							athleteID			: "$athleteID",
							competitionID	: "$competitionID",
							poolID				: "$poolID",
							teamID				: "$teamID",
							competitionName	: "$competitionName",
							pool					: "$pool",
							team					: "$team",
							datetime			: "$datetime",
							thumbnail			: "$thumbnail",
							rank					: "$rank"
							// No need to include timeStamp since the documents are pre-sorted
						}
					}
				}
			},
			// Step 3: Project and slice the first three records from the sorted times array.
			{
				$project: {
					gender		: "$_id.gender",
					style			: "$_id.style",
					course		: "$_id.course",
					distance	: "$_id.distance",
					timeCount	: 1,
					times			: { $slice: [ "$times", 1 ] },
					_id: 0
				}
			},
			{ $sort: { gender:1, style:1, course:1, distance:1 } }
		]
		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);
		const times = result.data.reduce((arr, time) => {
																let { times, ...discipline } = time;
																if (times.length > 0) {
																	discipline = { ...discipline, ...times[0] };
																	if (discipline.competitionID) discipline.competitionName = memoryDB.getCompetitionName(discipline.competitionID);
																	if (discipline.poolID) discipline.pool = memoryDB.getPoolName(discipline.poolID);
																	if (discipline.teamID) discipline.team = memoryDB.getTeamName(discipline.teamID);
																	arr.push(discipline);
																}
																return arr;
															}, []);
		return times;
	}

/**
	* Save or update a competition entry in the database, including handling a featured image.
	*
	* @param {Object} body - The data object containing competition information and image details.
	* @param {number|string} [body.competitionID] - The unique identifier for the competition. If 0 or missing, a new ID is generated.
	* @param {string} [body.sourcePath] - The file path to the featured image to save.
	* @param {string} [body.name] - The name of the competition.
	* @param {string|Date} [body.dateStart] - The starting date of the competition.
	* @param {string} [body.sido] - The location or administrative area.
	* @param {string} [body.course] - The course details of the competition.
	* @param {number|string} [body.poolID] - The ID of the associated pool.
	* @param {string} [body.memo] - Additional notes or remarks.
	* @param {number|string} [body.athleteID] - The ID of the athlete updating the competition.
	* @returns {Promise<Object>} An object containing a message and the competitionID of the saved or updated record.
	*/
	static saveWithImage = async (body) => {
		// Initialize an object to store the competition data.
		const value = {};

		// Determine the competition ID.
		if (!body.competitionID || body.competitionID == 0) {
				// If competitionID is 0 or not provided, generate a new ID.
				value.competitionID = await mongodb.max(mongoCFG.Medalbank.competitions, "competitionID", {}) + 1;
		} else {
				// Use the provided competitionID.
				value.competitionID = Number(body.competitionID);
		}

		// --------------------------------------------------------------
		// Save the featured image if a source path is provided.
		// --------------------------------------------------------------
		if (body.sourcePath) {
				const result = await imageLibrary.saveFile(
																					 body.sourcePath,
																					 "images",
																					 "competitions",
																					 value.competitionID,
																					 'f'	// 'f'eatured, 't'humbnail, '0'~'9'
																				 );
				// Update the featured image path in the value object.
				value.featured = `/cms/images/competitions/${value.competitionID}/f`;
		}

		// --------------------------------------------------------------
		// Update the fields in the value object.
		// --------------------------------------------------------------
		if (body.name			) value.fullname 	= body.name.trim();
		if (body.dateStart	) value.dateStart = new Date(body.dateStart);
		if (body.sido			) value.sido 			= body.sido.trim();
		if (body.course		) value.course 		= body.course.trim();
		if (body.poolID		) value.poolID 		= Number(body.poolID);
		if (body.memo			) value.memo 			= body.memo.trim();
		if (body.athleteID	) value.athleteID = Number(body.athleteID);

		// Update the last modified timestamp.
		value.updated = new Date();

		// Define the query to locate the competition entry in the database.
		const query = { competitionID: value.competitionID };

		// --------------------------------------------------------------
		// Update or insert the competition data in the database.
		// --------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, value);

		await historyLibrary.saveHistory(
												 "competitions", 
												 "saveWithImage", 
												 "competitionID", 
												 value,
											 ); // db, cmd, id, body
		// Return the response object with the competition ID.
		return { message: "", data: { competitionID: value.competitionID } };
	}

	// searchNames
	// 대회명 조회
 static async searchNames(body) {
	 console.log("----->", body);
	 const query = { fullname: new RegExp(body.name.trim(), "gi") };
	 if (body.type) query.competitionType = body.type;
	 const context =  {
		 query				: query,
		 projection		: { _id:0, competitionID:1, fullname: 1,sido:1, dateStart:1, course:1, poolID:1, pool:1, stemID:1 },
		 limit				: body.limit ? Number(body.limit) : MAX_LIMIT,
		 skip					: 0,
		 sort					: { fullname: 1 },
	 }
	 //-----> select competitions
	 //----------------------------------------------------------------
	 const result = await mongodb.find(mongoCFG.Medalbank.competitions, context);
	 result.data = result.data.reduce((arr, competition) => {
															 const stem = memoryDB.getStemName(competition.stemID);
															 competition.dateStart = new Date(competition.dateStart).toISOString().slice(0, 10);
															 competition.stem = stem != "" ? stem : competition.fullname;
															 arr.push(competition);
															 return arr;
														 },[])
														 .sort((a, b) => {
															 const stemCompare = a.stem.localeCompare(b.stem, 'ko');
															 if (stemCompare !== 0) return stemCompare;
															 return a.fullname.localeCompare(b.fullname, 'ko');
														 });
	 console.log("competitions===>", result.data.length);

	 return result;
	 //----------------------------------------------------------------
 }

 // stemNames
 // 대회명 조회
static async stemNames(body) {
	console.log("----->", body);
	const query = { stem: new RegExp(body.name.trim(), "gi") };
	const context =  {
		query				: query,
		projection		: { _id:0, stemID:1, stem: 1, },
		limit				: body.limit ? Number(body.limit) : MAX_LIMIT,
		skip					: 0,
		sort					: { stem: 1 },
	}
	//-----> select competitions
	//----------------------------------------------------------------
	const result = await mongodb.find(mongoCFG.Medalbank.stems, context);
	console.log("stems===>", result.data.length);

	return result;
	//----------------------------------------------------------------
}
static async saveStem(body) {
	const query = { stem: new RegExp(body.name.trim(), "gi") };
	//-----> select competitions
	//----------------------------------------------------------------
	const result = await mongodb.findOne(mongoCFG.Medalbank.stems, query, { _id:0, });
	if (result.data.stemID) return result; // stem이 있으면 return
	// stemID 확인 및 생성

	const value = {
		stem: body.name.trim(),
	};
	value.stemID = await mongodb.max(mongoCFG.Medalbank.stems, "stemID", {});
	await mongodb.insertOne(mongoCFG.Medalbank.stems, value);
	console.log("saveStem===>", value);


	return { message: '', data: value};
	//----------------------------------------------------------------
}


  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
  
	static async view(body) {
		/*
		const output = {
			extraInfo: {
				teamRank: [
					{ teamID, name, athleteCount, medals: 123 }
				],
				medalbankRank: [
					{ teamID, name, athleteCount, men, women, mixed, gold, silver, bronze, freestyle, ... }
				],
			},
			competitions: [
				{ dateStart, cmopetitionID, category, isAdult, fullname, athleteCount, pool }
			],
			seriesRecords:[
				{ gender, style, distance, name, timeID, time, datetime, competitionID, fullname },
			],
			records:[
				{ gender, style, distance, name, timeID, time, datetime, competitionID, fullname },
			],
			teams: [
				{ teamID, name, gold, silver, bronze, men, women, mixed, individual, team, athleteCount, timeCount, },
			],
			majorStyles: [
				{ gender, style, 25M, 50M, 100M, 200M, 400M, 800M, 1500M},
			],
			ageGroups: [
				{ ageGroup, count },
			],
		};
		*/
		//----------------------------------------------------------------
		const query = { competitionID: Number(body.competitionID) };
		const aggregate = [
			{ $match: query },
			{ $lookup: {
					from				: mongoCFG.Medalbank.pools,
					localField	: "poolID",
					foreignField: "poolID",
					as					: "pools"
				}
			},	
			{ $lookup: {
					from				: mongoCFG.Medalbank.times,
					localField	: "competitionID",
					foreignField: "competitionID",
					as					: "times"
				}
			},
			{
				$lookup: {
					from: mongoCFG.Medalbank.competitions,
					let: { stemID: "$stemID" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $ne: ["$$stemID", null] },        // stemID가 null이 아닌 경우
										{ $ne: ["$$stemID", undefined] },   // stemID가 undefined가 아닌 경우
										{ $eq: ["$stemID", "$$stemID"] }
									]
								}
							}
						},
						{
							$project: {
								_id: 0,          // _id 제외
								stemID: 1,       // stemID 포함
								competitionID: 1, // competitionID 포함    // stemID 포함
								fullname: 1,
								dateStart:1,
							}
						}
					],
					as: "stems"
				}
			},
			{ $lookup: {
					from				: mongoCFG.Medalbank.competitionsStatistics,
					localField	: "competitionID",
					foreignField: "competitionID",
					as					: "statistics"
				}
			},
		];
console.log("query:", query);
		//-----> select comment
		const result = await mongodb.aggregate(mongoCFG.Medalbank.competitions, aggregate);
		if (result.data.length == 0) return { message: "no data", data: {} };
		const competition = result.data[0];

		competition.pools = competition.pools && competition.pools.length > 0 ? competition.pools[0] : {};
		competition.pools = {
			poolID			: competition.pools.poolID,
			pool				: competition.pools.fullname || "",
			lengths			: competition.pools.lengths || "",
			lanes				: competition.pools.lanes || "",
			depthDeepEnd: competition.pools.depthDeepEnd || "",
			start				: competition.pools.start || "",
		};
		competition.competitions = competition.stems.filter(el => el.stemID != undefined)
																								.reduce((acc, cur) => {
																									// console.log(cur);
																						const value = {
																							// dateStart: new Date(cur.dateStart).toISOString().slice(0, 10),
																							sido		: cur.sido,
																							course	: cur.course,
																							name		: cur.fullname,
																							target	: cur.target || '',
																							masters	: cur.masters || true,
																							athleteCount	: cur.athleteCount || 0,
																							competitionID	: cur.competitionID,
																						};
																						if (cur.dateStart) value.dateStart = new Date(cur.dateStart).toISOString().slice(0, 10);	
																						acc.push(value);
																						return acc;
																					}, []);
		// competitionStatistics가 없으면 만들어 줌
		if (true || competition.statistics.length == 0) {
			competition.statistics = await this.buildStatistics(body.competitionID);
		} else competition.statistics = competition.statistics[0];

		// console.log("1>competition.bestTimes=", competition.statistics.bestTimes);

		if (competition.statistics.bestTimes) {
		competition.statistics.bestTimes = competition.statistics.bestTimes.reduce((arr, cur) => {
																																					const comp = memoryDB.getCompetition(cur.times[0].competitionID);
																																					const value = {
																																						gender					: cur.gender,
																																						style						: cur.style,
																																						distance				: cur.distance,
																																						timeID					: cur.times[0].timeID,
																																						name						: cur.times[0].name,
																																						time						: cur.times[0].time,
																																						competitionID		: cur.times[0].competitionID,
																																						datetime				: comp.datetime ?? "",
																																						thumbnail				: comp.thumbnail ?? "",
																																						pool						: comp.pool,
																																						competitionName	: comp.fullname,
																																					};
																																					arr.push(value);
																																					return arr;
																																				},	[]);
		} else {
			competition.statistics.bestTimes = [];
		}
		// console.log("2>competition.bestTimes=", competition.statistics.teams);

		await StaticLibrary.updateViewReactions("competitions", competition.timeID, competition.fullname, body.userID??0); // db, id, name, userID
		return { message: '', data: competition};
		//----------------------------------------------------------------
	}
	static getUpcommingCompetitions = (async (body) => {
		const today = new Date();
		const todaytz = new Date(today.setHours(today.getHours()));

		const todayLocal00 = new Date(
																todaytz.getFullYear(),
																todaytz.getMonth(),
																todaytz.getDate(),
																swimmingCFG.timezone,
																0, 0, 0
															);

		const query = { dateStart: { $exists: true }, dateStart: { $gt: todayLocal00 } };
		// console.log(today, todaytz, todayLocal00, query);
		return await this.list(query, body);
	});
	
	
	 //==================================================
	 static async buildStatistics(competitionID) {
		 const query = { competitionID: Number(competitionID) };
		 console.log("build competitionsStatistics...", competitionID);
		 const context = {
			 query			: query,
			 projection: { _id:0, timeID:1, athleteID:1, name:1, gender:1, style:1, course:1, distance:1, ageGroupORG:1, ageGroup:1, round:1, time:1, timeStamp:1, rank:1, teamID:1, competitionID:1, competitionName:1, poolID:1, thumbnail:1, datetime:1, },
			 limit			: 10000,
			 skip			: 0,
		 };
		 const times = await mongodb.find(mongoCFG.Medalbank.times, context);
		//  console.log("---->", times.data);
		 if (times.data.length == 0) return {};
		 const bestOBJ = timeLibrary.findBestTime(times.data);
 
		 const buildTimes = bestOBJ;
		 // const buildTimes = [];
		 // Object.keys(bestOBJ).forEach(key => {
		 // 	const value = bestOBJ[key];
		 // 	const arr = key.split('-');
		 // 	value.style = arr[0];
		 // 	value.distance = arr[1];
		 // 	const competition = memoryDB.getCompetition(value.competitionID);
		 // 	value.competitionName = competition ? competition.fullname : "";
		 // 	buildTimes.push(value);
		 // });
		 const styleOBJ = timeLibrary.checkExistsDistance(times.data);
		 const styles = [];
		 Object.keys(styleOBJ).forEach(key => {
			 const value = styleOBJ[key];
			 const arr = key.split('-');
			 value.gender = arr[0];
			 value.style = arr[1];
			 styles.push(value);
		 });

		 
		 const teamOBJ = _.countBy(times.data, "teamID");
		 const teams = Object.keys(teamOBJ).reduce((arr,teamID) => {
																					const team = memoryDB.getTeam(Number(teamID));
																					arr.push({ teamID: Number(teamID), name: team.name ?? '', count: teamOBJ[teamID] });
																					return arr;
																				}, []);
		 const statistics = {
			 styleDistances: styles,
			 bestTimes			: buildTimes,
			 teams					: leaderboard.countByTeam(times.data),
			 ageGroups			: leaderboard.getAgeGroupByCount(times.data),
		 }

		 // update competitionsStatics
		 await mongodb.updateOne(mongoCFG.Medalbank.competitionsStatistics, query, statistics);
		 return statistics;
	 }
	 
 

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################

	// upcomings
	static async upcomings(body) {
		const year = new Date().getFullYear();
		console.log( year, new Date(year-1, 0, 1, 9, 0, 0), new Date(year, 11, 31, 9, 0, 0));
	
		const context =  {
			// query				: { dateStart: { $gte:new Date(year-1, 0, 1, 9, 0, 0), $lte: new Date(year, 11, 31, 9, 0, 0) } },
			query				: { year: { $gte:(year-1), $lte: year } },
			projection	: { _id:0, competitionID:1, fullname: 1, stem:1, dateStart:1, year:1, pool:1, sido:1 },
			limit				: 10000,
			skip				: 0,
			sort				: { dateStart: -1 },
		}
		console.log( context.query);
		//-----> select competitions
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Medalbank.competitions, context);
		for (const competition of result.data) {

		}
		result.data = result.data.reduce((arr, competition) => {
			if (competition.dateStart && typeof competition.dateStart != "string") {
				competition.dateStart = typeof competition.dateStart == "string" ? competition.dateStart : competition.dateStart.toISOString().slice(0, 10);
			}
			arr.push(competition);
			return arr;
		}, []);
		return result;
		//----------------------------------------------------------------
	}
	
	// names
	static async names(body) {
		const result = await mongodb.distinct(mongoCFG.Medalbank.times, "competitionID");
		if (result.data.length == 0) return result;
	
		const context =  {
			query				: { competitionID: { $in: result.data } },
			projection	: { _id:0, competitionID:1, fullname: 1, stemID:1},
			limit				: body.limit ? Number(body.limit) : MAX_LIMIT,
			skip				: 0,
			sort				: { competitionID: 1 },
		}
		//-----> select competitions
		//----------------------------------------------------------------
		return await mongodb.find(mongoCFG.Medalbank.competitions, context);
		//----------------------------------------------------------------
	}
	
	// years
	static async years(body) {
		//----------------------------------------------------------------
		const result = await mongodb.distinct(mongoCFG.Medalbank.competitions, "year",{ fullname: { $exists: true }, year:{$gt:0} });
		result.data = result.data.sort((a, b) => b-a).slice(0, 10).map(data => data.toString());
		return result;
		//----------------------------------------------------------------
	}
	// monthGroup
	static async monthGroup(body) {
		const returnObj = { message: '', data: [], };
		//----------------------------------------------------------------
		const result = await this.list( {dateStart: { $exists:true } }, body );
		//----------------------------------------------------------------
		if (result.data.length == 0) return returnObj;

		//-----
		const competitionOBJ = {};
		result.data.sort((a,b)=> b.dateStart.localeCompare(a.dateStart)).forEach(item => {
			if (item.dateStart) {
				const yearMonth = item.dateStart.slice(0, 7);
				if (!competitionOBJ[yearMonth]) {
					competitionOBJ[yearMonth] = { yearMonth, competitions: [] };
				}
				competitionOBJ[yearMonth].competitions.push(item);
			}
		});
		return { message:'', data: competitionOBJ };
	}

	static async ageGroup(body) {
		const query = { competitionID: Number(body.cid) };
		//------------------------------------------------------------------
		let result = await mongodb.findOne(mongoCFG.Medalbank.competitions, query, { _id:0, ageGroup:1 }  );
		//-----> check undefined
		if (!result.data.ageGroup || result.data.ageGroup.length == 0) {
			result = await mongodb.distinct(mongoCFG.Medalbank.times, "ageGroup", query );
			await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, { ageGroup: result.data } );
		} else {
			result.data = result.data.ageGroup;
		}
		return result;
	}

	static async backendList(query, body) {
		//------------------------------------------------------------------
		const context = {
			query			: query,
			projection: { _id:0, },
			limit			: 10000,
			skip			: 0,
			sort			: { dateStart: -1 }
		}
	console.log("query=", query);
		const returnObj = await mongodb.find(mongoCFG.Medalbank.competitions, context);
		console.log("query=", query, returnObj.data.length);
		returnObj.data = returnObj.data.reduce((arr, comp) => {
																			const item = Customizing.field(comp);
																			if (comp.dateStart)				item.dateStart = new Date(item.dateStart).toISOString().slice(0, 10);
																			if (comp.dateEnd)					item.dateEnd = new Date(item.dateEnd).toISOString().slice(0, 10);
																			if (comp.dateStartSignup)	item.dateStartSignup = new Date(comp.dateStartSignup).toISOString().slice(0, 10);
																			if (comp.dateEndSignup) 	item.dateEndSignup = new Date(comp.dateEndSignup).toISOString().slice(0, 10);
																			if (comp.dateStartReceipt)item.dateStartReceipt = new Date(comp.dateStartReceipt).toISOString().slice(0, 10);
																			if (comp.dateEndReceipt) 	item.dateEndReceipt = new Date(comp.dateEndReceipt).toISOString().slice(0, 10);
																			arr.push(item);
																			return arr;
																		}, []);
		return returnObj;
	}

	static async backendListName(body) {
		console.log("backendListName=", body);
		const query = { fullname: new RegExp(body.name, "gi") };
		return await this.backendList(query, body);
	}

	static async backendListYear(body) {
		console.log("backendListYear=", body);
		const query = { year: Number(body.year) };
		return await this.backendList(query, body);
	}

	static async times(body) {
		const query = {};
		if (body.year)			query = { year: Number(body.year) };
	
		const res = await mongodb.distinct(mongoCFG.Medalbank.times, "competitionID");
		const context =  {
			query				: { competitionID: { $in: res.data } },
			projection	: { _id:0, },
			limit				: 20,
			skip				: 0,
			sort				: { competitionID: -1 },
		}
	
		//----->
		const result = await mongodb.find(mongoCFG.Medalbank.competitions, context);
	
		//-----> customizing
		// for (const data of result.data) {
		// 	// console.log("++++", data);
		// 	returnObj.data.push(this.customizingBrief(data));
		// }

		result.data = result.data.map(data => Customizing.field(data));
		console.log("database.competitions.list.competitions=", result.data.length); // .slice(0, 10));
	
		return result;
	}
	static getBySido		 = (async (body) => await this.list({ sido: body.sido.trim() }, body));
	static getByPoolID	 = (async (body) => await this.list({ poolID: Number(body.poolID) }, body));
	static getByStemID	 = (async (body) => await this.list({ stemID: Number(body.stemID) }, body));
	static getByCourse	 = (async (body) => await this.list({ course: body.course.trim() }, body));
	static getByMeasured = (async (body) => await this.list({ measured: { $exists: true } }, body));
	static getByYear		 = (async (body) => await this.list({ year: Number(body.year) }, body));
	static getByName		 = (async (body) => await this.list({ name: Number(body.year) }, body));

	// insert
	static async insert(body) {
		console.log(body.dateStart);
		const value = Customizing.field(body);
		console.log(body.dateStart, value.dateStart);
		//----------------------------------------------------------------
		value.competitionID = await mongodb.max(mongoCFG.Medalbank.competitions, "competitionID", {}); // query, db
		console.log(">>>>>>>>>>>>>> competitions.insert.value=", value);
		 await mongodb.insertOne(mongoCFG.Medalbank.competitions, value);
		 return { message: '', data: { competitionID: value.competitionID } };
		//----------------------------------------------------------------
	}

	// update
	static async update(body) {
		console.log("======> competitions.update.body.", body);
		const value = Customizing.field(body);
		if (!body.competitionID) {
			value.competitionID = await mongodb.max(mongoCFG.Medalbank.competitions, "competitionID", {}); // query, db
			value.created = new Date();
		} else {
			value.update = new Date();
		}

		const query = { competitionID: value.competitionID };

		console.log("competition.update=", query, value);
		//----------------------------------------------------------------
		await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, value);
		return { message: '', data: value };
		//----------------------------------------------------------------
	}

  // update status to delete
  static async updateDelete(competitionID, userID) {
    const query = { competitionID: Number(competitionID), userID: Number(userID) };
		const value = {
      status  : 'deleted',
      deleted : new Date(),
    }
	
		//----------------------------------------------------------------
		returnObj = await mongodb.updateOne(mongoCFG.Medalbank.competitions, query, value);
		//----------------------------------------------------------------

    return returnObj;
  }

	// delete
	static async delete(competitionID) {
		try {
			const query = { competitionID: Number(competitionID) };
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Medalbank.competitions, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","competitions", "delete", "catch." + err);
		}
	}

}

module.exports = CompetitionModel;

