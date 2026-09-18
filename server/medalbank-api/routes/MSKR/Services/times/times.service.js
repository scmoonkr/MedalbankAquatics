const {swimmingCFG} 		= require('../../Config/swimmingCFG');
const UtilDate		= require("../../Class/DateLibrary");
const utilError		= require("../../Util/utilError");
const TimeModel		= require("./times.model");
const Customizing	= require("./times.custom");
const utilDate		= new UtilDate();

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class timeServices {

	static async create() {
		//-----------------------------------------
		return await TimeModel.create();
		//-----------------------------------------
	}

	static async searchNames(body) {
		// try{
			if (!body.name) return utilError.errorMSG("Service","times", "timelists", "name not found");
			body = this.parsingNameStyleDistance(body);

			// console.log(body, arr);				

			// 문성중 50 평영영
			//-----------------------------------------
			const result = await TimeModel.searchNames(body);
			//-----------------------------------------
			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "timelists", "catch." + err.message);
		// }
	}

	static async notMyTime(body) {
		console.log("notMyTime=", body);
		try{
			if (!body.timeID) return utilError.errorMSG("Service","times", "notMyTime", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "notMyTime", "timeID not numbers");

			//-----------------------------------------
			const result = await TimeModel.notMyTime(body);
			//-----------------------------------------
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","times", "notMyTime", "catch." + err.message);
		}
	}

	static parsingNameStyleDistance(body) {
		// body.name = arr[0];
		let arr = body.name.replace(/\s{2,}/g, ' ')
											.replace(/ /gi, ",")
											.split(',')
											.filter(el => el);
		// body.name = arr[0];
		console.log("bf.parsingNameStyleDistance:", body);
		for (let field of arr) {
			if (!field) continue;
			const check = swimmingCFG.stylesEngKor.find(el => el.kor==field);
			if (check) {
				body.style = check.eng;
				arr = arr.filter(el => el != field);
			} else {
				field = field.replace("M", "");
				if (!isNaN(field)) {
					body.distance = `${field}M`;
					arr = arr.filter(el => el != field);
				} else {
					// body.name = field;
				}
			}
		}
		body.name = arr.map(el => decodeURIComponent(el));
		console.log("af.parsingNameStyleDistance:", body);
		return body;
	}

	static async searchNameStyle(body) {
		// try{
			if (!body.name) return utilError.errorMSG("Service","times", "timelists", "name not found");

			body = this.parsingNameStyleDistance(body);
			// console.log(body, arr);				

			body.name = body.name.join(',');
			//-----------------------------------------
			const result = await TimeModel.searchNameStyle(body);
			//-----------------------------------------
			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "timelists", "catch." + err.message);
		// }
	}

	static async view(body) {
		// try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "view", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "view", "timeID not numbers");
			if (!body.userID			) return utilError.errorMSG("Service","times", "view", "userID not found");
			if (isNaN(body.userID))return utilError.errorMSG("Service","times", "view", "userID not numbers");
			//-----------------------------------------
			return await TimeModel.view(body);
			//-----------------------------------------			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "detail", "catch." + err.message);
		// }
	}

	static async list(body) {
		try{
			let query = {
				$or: [ {status: ""}, { status: { $exists: false }}],
				timeStamp	: { $gt: 0 }, 
				// isMasters : true,
				// isAdult 	: true,
				fin				: { $exists: false }
			};

			if (body.gender		  )	query.gender    = body.gender;
			if (body.name		    )	{
				query.name      = new RegExp("^" + body.name.trim());
			} else if (body.time		  )	{
					query.timeStamp     = utilDate.convertString2Timestamp(body.time);
			} else {
				if (!body.athleteID && body.completed == true) {
					query = { $or: [
							{ athleteID: { $exists: false } },
							{ athleteID: { $eq: 0 } },
						],
					};
				}
				if (body.poolID			)	query.poolID = Number(body.poolID);
				if (body.athleteID  )	query.athleteID = Number(body.athleteID);
				if (body.competitionID) {
					query = {
						$or: [ {status: ""}, { status: { $exists: false }}],
						style: { $in: ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"]},
						timeStamp	: { $gt: 0 }, 
					};
					if (Array.isArray(body.competitionID)) {
						if (body.competitionID.indexOf(0) < 0) {
							query.competitionID = { $in: body.competitionID };
						}
					} else {
						if (body.competitionID != '0') {
							query.competitionID = Number(body.competitionID);
						}
					}
				}
				
				if (body.style		  )	{
					query.style     = body.style;
				} else {
					query.style = { $in: ["freestyle", "backstroke", "breaststroke", "butterfly", "individualMedley"] };
				}
				if (body.category	  )	query.isMasters = body.category == "masters";
				if (body.typeTime 	)	query.type 			= body.typeTime.replace("Result", "");
				if (body.ageGroup	  )	query.ageGroup  = body.ageGroup;
				if (body.course		  )	query.course    = body.course;
				if (body.distance	  )	query.distance  = body.distance;
				if (body.round		  )	query.round     = body.round;
				if (body.adult  		)	query.isAdult 	= body.adult == "성인";
				// if (body.isAdult  	)	query.isAdult 	= body.isAdult;
				if (body.masters	  )	query.isMasters = body.masters !== "등록";
				if (body.isMasters  )	query.isMasters = body.isMasters;
				if (body.sido	  		)	query.sido  		= body.sido;
				if (body.eventCode  )  query.heatCode = body.heatCode;
				if (body.data       )	query.name      = new RegExp("^" + body.data.trim());
				if (body.ageGroup	  )	query.ageGroup  = body.ageGroup;
			}
			if (body.timeID		  )	{
				query = { timeID: Number(body.timeID) };
			}

			return TimeModel.list(query, body);
			return body.ageGroup == undefined || body.ageGroup == ''
									? TimeModel.list(query, body)
									: TimeModel.listElite(query, body);
		} catch (err) {
			return utilError.errorMSG("Service","times", "list", "catch." + err.message);
		}
	}

	//####################################################################
	//######### Confirm ##################################################
	//####################################################################


	static async detail(body) {
		console.log("times.detail.body=", body);
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "detail", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "detail", "timeID not numbers");
			// if (!body.athleteID			) return utilError.errorMSG("Service","times", "detail", "athleteID not found");
			// if (isNaN(body.athleteID))return utilError.errorMSG("Service","times", "detail", "athleteID not numbers");
			//-----------------------------------------
			return await TimeModel.detail(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","times", "detail", "catch." + err.message);
		}
	}

	static async insert(body) {
		try{
			//-----------------------------------------
			return await TimeModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "insert", "catch." + err.message);
		}
	}

	static async saveTimeWithImageURL(req) {
		console.log("times.services.saveTimeWithImageURL.body=", req.body);
		// try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.saveTimeWithImageURL.req.file:", req.file.path);
			}

			const time = body.time;

			if (!body.timeID				) return utilError.errorMSG("Service","times", "saveTimeWithImageURL", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "saveTimeWithImageURL", "timeID not numbers");
			if (!body.imageURL			) return utilError.errorMSG("Service","times", "saveTimeWithImageURL", "imageURL not found");

			console.log("~~~~~~~~~~> saveTimeWithImageURL.", body);
			//-----------------------------------------
			return await TimeModel.saveTimeWithImageURL(body);
			//-----------------------------------------			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "saveTimeWithImage", "catch." + err.message);
		// }
	}

	static async saveTimeWithImage(req) {
		console.log("times.services.saveTimeWithImage.body=", req.body);
		// try{
			const body = req.body;
			if (req.file) {
				body.sourcePath = req.file.path; // multer가 저장한 파일의 경로
				console.log("times.saveTimeWithImage.req.file:", req.file.path);
			}

			const time = body.time;

			if (!body.timeID				) return utilError.errorMSG("Service","times", "saveTimeWithImage", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "saveTimeWithImage", "timeID not numbers");

			console.log("~~~~~~~~~~> saveTimeWithImage.", body);
			//-----------------------------------------
			return await TimeModel.saveTimeWithImage(body);
			//-----------------------------------------			return result;
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "saveTimeWithImage", "catch." + err.message);
		// }
	}

	static async delete(body) {
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "delete", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "delete", "timeID not numbers");
			//-----------------------------------------
			return await TimeModel.delete(body.timeID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "delete", "catch." + err.message);
		}
	}

	static async deleteUpdate(body) {
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "deleteUpdate", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "deleteUpdate", "timeID not numbers");
			//-----------------------------------------
			return await TimeModel.deleteUpdate(body.timeID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "deleteUpdate", "catch." + err.message);
		}
	}

	static async deleteMSKR(body) {
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "deleteMSKR", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "deleteMSKR", "timeID not numbers");
			//-----------------------------------------
			return await TimeModel.deleteMSKR(body.timeID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "deleteMSKR", "catch." + err.message);
		}
	}

	static async updateTimes(body) {
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "updateTimes", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "updateTimes", "timeID not numbers");
			if (!body.times					) return utilError.errorMSG("Service","times", "updateTimes", "times not found");
			//-----------------------------------------
			return await TimeModel.updateTimes(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "updateTimes", "catch." + err.message);
		}
	}

	static async updateTimesMSKR(body) {
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "updateTimesMSKR", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "updateTimesMSKR", "timeID not numbers");
			// if (!body.times					) return utilError.errorMSG("Service","times", "updateTimesMSKR", "times not found");
			//-----------------------------------------
			return await TimeModel.updateTimesMSKR(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "updateTimes", "catch." + err.message);
		}
	}
	//####################################################################
	//######### Confirm ##################################################
	//####################################################################

	static async update(body) {
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "update", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "update", "timeID not numbers");
			//-----------------------------------------
			return await TimeModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "update", "catch." + err.message);
		}
	}

	static async updateDelete(body) {
		try{
			if (!body.timeID				) return utilError.errorMSG("Service","times", "update", "timeID not found");
			if (isNaN(body.timeID)	) return utilError.errorMSG("Service","times", "update", "timeID not numbers");
			if (!body.athleteID				) return utilError.errorMSG("Service","times", "update", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","times", "update", "athleteID not numbers");
			//-----------------------------------------
			return await TimeModel.updateDelete(body.timeID, body.athleteID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "update", "catch." + err.message);
		}
	}
	/*
		*	search names, style
		* '홍길동 박문수 평형 자유형'
		*/
	static async searchNamesStyles(body) {
		try{
			//-----------------------------------------
			if (!body.data) return utilError.errorMSG("Service","times", "searchNamesStyles", "data not found");
			return await TimeModel.searchNamesStyles(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "searchNamesStyles", "catch." + err.message);
		}
	}

	static async reportTop(body) {
		try{
			//-----------------------------------------
			return await TimeModel.reportTop(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "reportTop", "catch." + err.message);
		}
	}

	static async ranking(body) {
		console.log("ranking=", body);
		try{
			if (!body.gender		) return utilError.errorMSG("Service","times", "ranking", "gender not found");
			if (!body.style			) return utilError.errorMSG("Service","times", "ranking", "style not found");
			if (!body.distance	) return utilError.errorMSG("Service","times", "ranking", "distance not found");
      if (!body.limit     ) body.limit = 100;
			//-----------------------------------------
			if (body.ranking || body.times) return await TimeModel.searchRanking(body);
			return await TimeModel.ranking(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "ranking", "catch." + err.message);
		}
	}

	static async rankingTopN(body) {
		console.log("rankingTopN=", body);
		try{
			//-----------------------------------------
			body.limit = 1;
			return await TimeModel.rankingTopN(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "rankingTopN", "catch." + err.message);
		}
	}

	static async heatsheets(body) {
		console.log("Service.times.heatsheets.body=", body);
		try{
			if (!body.names					) return utilError.errorMSG("Service","times", "heatSheets", "names not found");
			if (!body.style					) return utilError.errorMSG("Service","times", "heatSheets", "style not found");
			if (!body.distance			) body.distance = "50M";
			//-----------------------------------------
			return await TimeModel.heatSheets(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","times", "heatSheets", "catch." + err.message);
		}
	}

	static async saveTimeResult(body) {
		console.log("Service.times.saveTimeResult.body=", body);
		try{
			// if (!body.athleteID				) return utilError.errorMSG("Service","times", "saveTimeResult", "athleteID not found");
			// if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","times", "saveTimeResult", "athleteID not numbers");
			if (!body.time						) return utilError.errorMSG("Service","times", "saveTimeResult", "timr not found");
			// if (!body.style					) return utilError.errorMSG("Service","times", "saveTimeResult", "style not found");
			//-----------------------------------------
			return await TimeModel.saveTimeResult(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","times", "saveTimeResult", "catch." + err.message);
		}
	}

	static async saveTimeResultNew(body) {
		// console.log("Service.times.saveTimeResultNew.body=", body);
		try{
			// if (!body.athleteID				) return utilError.errorMSG("Service","times", "saveTimeResultNew", "athleteID not found");
			// if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","times", "saveTimeResultNew", "athleteID not numbers");
			if (!body.time						) return utilError.errorMSG("Service","times", "saveTimeResultNew", "time not found");
			if (!body.name						) return utilError.errorMSG("Service","times", "saveTimeResultNew", "name not found");
			// if (!body.style					) return utilError.errorMSG("Service","times", "saveTimeResultNew", "style not found");
			//-----------------------------------------
			return await TimeModel.saveTimeResultNew(body); // times/edit
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","times", "saveTimeResultNew", "catch." + err.message);
		}
	}

	static async insertTimeResultMSKR(body) {
		console.log("Service.times.insertTimeResultMSKR.body=", body);
		try{
			if (!body.athleteID				) return utilError.errorMSG("Service","times", "insertTimeResultMSKR", "athleteID not found");
			if (isNaN(body.athleteID)	) return utilError.errorMSG("Service","times", "insertTimeResultMSKR", "athleteID not numbers");
			if (!body.time						) return utilError.errorMSG("Service","times", "insertTimeResultMSKR", "timr not found");
			// if (!body.style					) return utilError.errorMSG("Service","times", "saveTimeResult", "style not found");
			//-----------------------------------------
			return await TimeModel.insertTimeResultMSKR(body);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","times", "insertTimeResultMSKR", "catch." + err.message);
		}
	}

	static async latests(body) {
		console.log("-Service.times.latests.body=", body);
		// try{
			//-----------------------------------------
			body.limit = 3;
			const result = {};
			result.leaderboards = await TimeModel.leaderboards(body);
			result.statics = await TimeModel.loadStatics();
			const teamOBJ = await TimeModel.loadTeams({name: { $exists: true }});
			
			//-------------------------------------------------------
			//	teams
			//-------------------------------------------------------
			result.teams = Object.values(teamOBJ)
																.reduce((arr, team) => {
																	arr.push({
																		teamID: team.teamID,
																		name: team.name,
																		logo: team.logo,
																	});
																	return arr;
																}, [])
																.filter(team => team.logo)
																.sort((a,b) => a.name.localeCompare(b.name));

			return result;
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "latests", "catch." + err.message);
		// }
	}

	static async backendList(body) {
		try{
			//-----------------------------------------
			return await TimeModel.backendList(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "backendList", "catch." + err.message);
		}
	}

	static async medalists(body) {
		try{
			//-----------------------------------------
			return await TimeModel.medalists();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "medalists", "catch." + err.message);
		}
	}

	static async records(body) {
		// try{
			//-----------------------------------------
			return await TimeModel.records();
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "records", "catch." + err.message);
		// }
	}

	// ranking: 20
	// athlete: 이광중
	// 
	static async searchRanking(body) {
		// try{
			//-----------------------------------------
			return await TimeModel.searchRanking(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","times", "searchRanking", "catch." + err.message);
		// }
	}

	static async updateTimesAthleteID(body) {
		try{
			//-----------------------------------------
			return await TimeModel.updateTimesAthleteID();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "updateTimesAthleteID", "catch." + err.message);
		}
	}

	static async removeTimesAthleteID(body) {
		try{
			//-----------------------------------------
			return await TimeModel.removeTimesAthleteID();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","times", "removeTimesAthleteID", "catch." + err.message);
		}
	}


}

module.exports = timeServices;