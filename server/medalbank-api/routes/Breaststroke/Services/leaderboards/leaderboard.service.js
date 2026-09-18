const LeaderboardModel	= require("./leaderboard.model.js");
const utilError					= require("../../Class/utilError");
const UtilDate					= require("../../Class/DateLibrary.js");
const utilDate					= new UtilDate();

const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Breaststroke.database);
const TimeLibrary	= require("../../Class/TimeLibrary");
const {eliteAgeGroup} = require("../../Class/swimmingLibrary");
const timeLibrary = new TimeLibrary();

const timeLimit = 100;
const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class LeaderboardServices {
	// list
	static async list(body) {
		body.limit = body.limit || 100;
		let result = { message: "", data: [] };
		// console.log("leaderboard.service.listRealtime.body:", body);
		// try {
			// Required fields validation
			const requiredFields = ['gender', 'discipline', 'course', 'distance'];
			for (let field of requiredFields) {
				if (!body[field]) {
					return utilError.errorMSG("Service", "leaderboard", "list", `${field} not found`);
				}
			}
	
			// Build base query object
			const query = {};
			if (body.name			) query.name			= new RegExp(body.name, 'gi');
			if (body.typeTime	) query.type			= body.typeTime.replace("Result", '');
			if (query.type == "event") delete query.type;
			if (body.gender && body.gender != "성별무관") query.gender		= body.gender;
			if (body.discipline		) query.discipline			= body.discipline;
			if (body.course		) query.course		= body.course;
			if (body.distance	) query.distance	= body.distance;
	
			// Additional query fields
			if (body.sido && body.sido !== "전국") query.sido = body.sido;
	
			// Age group handling
			if (body.ageGroup && body.ageGroup !== "00") {
				query.ageGroupCode = body.ageGroup === "09" 
																						? { $in: ["01", "03", "05"] }  // 학생 group
																						: body.ageGroup === "10" 
																							? { $gte: "11" }  // 성인 group
																							: body.ageGroup;
			}
	
			// Group handling
			// if (body.group && body.group !== "all") {
			// 	body.group = body.group.split('-')[0];
			// }
	
			// Name handling
			if (body.name) {
				query.name = new RegExp(body.name.trim(), "gi");
			} else {
				query['$or'] = [{ deleted: { $exists: false } }, { deleted: "" }];
			}

			// Current date variables
			let today = new Date();
			today.setHours(9,0,0,0); // set timezone: +9(Korean)
			let endDate = new Date(today);  // today의 복사본 생성
			endDate.setDate(today.getDate() + 1);  // 날짜에 1을 더해 다음 날로 설정
			const [year, month, day, week] = [
				today.getFullYear(),
				today.getMonth()+1,
				today.getDate(),
				utilDate.getWeekOfMonth(today)
			];
			// query.datetime	= { $gte: startDate, $lt: endDate }

			const limit = body.limit ? Number(body.limit) : timeLimit;
			let skip = (Number(body.page??1)-1)	* limit;
			skip = skip < 0 ? 0 : skip;
			console.log("111>", body);

		// Handle `group` based queries and determine `realtime`
			let realtime = false;
			if (body.group) {
				const parsedDate = body.date ? body.date.split('-').map(Number) : [];
				switch (body.group) {
					//-----
					case "all":
						// Object.assign(query, { year: parsedDate[0] || year, group: "year" });
						result = await LeaderboardModel.list(query, limit, skip);
						break;
					//-----
					case "year":
						query['$expr'] = {
							$eq: [
								{ $year: "$datetime" }, Number(body.year),
							]
						}; // datetime의 연도가 2023인지 확인
						result = await LeaderboardModel.list(query, limit, skip);
						break;
					//-----
					case "month":
						query['$expr'] = {
							$and: [
								{ $eq: [{ $year: "$datetime" }, Number(body.year)] },
								{ $eq: [{ $month: "$datetime" }, Number(body.month)] }
							]
						}; // datetime의 year, month 인지 확인
						result = await LeaderboardModel.list(query, limit, skip);
						break;
					//-----
					case "lastWeek":
						const { start, end } = utilDate.getLastWeek();
						Object.assign(query, { datetime: { $gte: start, $lt: end } });
						result = await LeaderboardModel.list(query, limit, skip);
						break;
					//-----
					case "yesterday":
						query['$expr'] = {
							$and: [
								{ $eq: [{ $year: "$datetime" }, year] },
								{ $eq: [{ $month: "$datetime" }, month] },
								{ $eq: [{ $day: "$datetime" }, day-1] }
							]
						}; // datetime의 year, month 인지 확인
						Object.assign(query, { year: parsedDate[0], month: parsedDate[1], day: parsedDate[2], group: "day" });
						result = await LeaderboardModel.list(query, limit, skip);
						// result = await LeaderboardModel.list(query, body);
						break;
					//-----
					case "thisYear":
						query['$expr'] = {
							$eq: [
								{ $year: "$datetime" }, year,
							]
						}; // datetime의 연도가 2023인지 확인
						result = await LeaderboardModel.list(query, limit, skip);
						break;
					//-----
					case "thisMonth":
						query['$expr'] = {
							$and: [
								{ $eq: [{ $year: "$datetime" }, year] },
								{ $eq: [{ $month: "$datetime" }, month] }
							]
						}; // datetime의 year, month 인지 확인
						result = await LeaderboardModel.list(query, limit, skip);
						break;
					//-----
					case "week":
						// query.startDate = getStartOfWeek(today);
						// query.endDate = endDate;
						today = new Date(getStartOfWeek(today));
						today.setHours(9,0,0,0); // set timezone: +9(Korean)
						const {	start1, end1 } = utilDate.getThisWeek();
						query.datetime = { $gte: start1, $lt: end1 };
						result = await LeaderboardModel.list(query, limit, skip);
						break;
					//-----
					case "today":
						query['$expr'] = {
							$and: [
								{ $eq: [{ $year: "$datetime" }, year] },
								{ $eq: [{ $month: "$datetime" }, month] },
								{ $eq: [{ $day: "$datetime" }, day] }
							]
						}; // datetime의 year, month 인지 확인
						result = await LeaderboardModel.list(query, limit, skip);
						break;
				} // end switch
			}	else {
				// query.datetime = { $gte: new Date(year, 0, 1, 9, 0, 0, 0), $lt: endDate };
				// result = await LeaderboardModel.listRealtime(query, body.limit);
				// result = await LeaderboardModel.list(query, body);
				result = await LeaderboardModel.list(query, limit, skip);
			}
			
			// // console.log("----->", athlete.data);
			// result.data.times = timeLibrary.updateAthleteIDs(result.data.times, athlete.data);
			result.data.times = await timeLibrary.checkRegisteredAthlete(result.data.times);

			// console.log("aaaaa-----> leaderboard: ", result.data);
			return result;		
			
		// } catch (err) {
		// 	result = utilError.errorMSG("Service", "leaderboard", "list", `catch. ${err.message}`);
		// }
	}

	// getLeaderboardRealtime= {
	// 	name: '',
	// 	typeTime: 'eventResult',
	// 	gender: 'men',
	// 	discipline: 'freestyle',
	// 	distance: '50M',
	// 	course: 'LCM',
	// 	ageGroup: '00',
	// 	sido: '전국',
	// 	dateType: 'all',
	// 	page: 1,
	// 	limit: '200'
	// }
	static async listRealtime(body) {
		console.log("BR.Services.listRealtime.body=", body);
		let result;
		if (body.sido) {
			body.sido = body.sido.replace("전국", '');
		}
		if (body.ageGroup) {
			body.ageGroup = body.ageGroup.replace("00", '');
		}

		const query = {
			// athleteID: { $gt: 0 },
			timeStamp			: { $gt: 0 },
			// type					: "event",	// time | event | club
			// isMasters			: true,
			// isAdult				: true,
		}

		if (body.db == 'Breaststroke') query.athleteID = { $gt: 0 };
		// all|year|month|week|day|period
		if (body.group	 	) {
			const dateQuery = mongodb.makeDateQuery(body.type, body.date, body.dateTo);
			if (Object.keys(dateQuery).length > 0) query.datetime = dateQuery;
		}

		// discipline
		if (body.masters 	) query.isMasters	= body.masters == "비등록";
		// if (body.adult && body.adult != "전체") query.isAdult		= body.adult == "성인";
		if (body.style	 	) query.discipline			= body.discipline;
		if (body.discipline	 	) query.discipline			= body.discipline;
		if (body.gender && body.gender!= "성별무관") query.gender		= body.gender;
		if (body.course	 	) query.course		= body.course;
		if (body.distance	) query.distance	= body.distance;
		if (body.ageGroup	) query.ageGroup 	= body.ageGroup;
		if (body.sido		 	) query.sido			= body.sido;
		if (body.typeTime )	query.type 			= body.typeTime.replace("Result", "");

		query.timeStamp = { $gt: 0, $lt: 0.0416665509259000 };
		if (body.type=='olympiad') {
			query.discipline = body.discipline; // { $in: ["BRZS", "BROS", "BRMS", "BROW", "BRUW"] };
			query.type = 'medalbank'
			query.course = body.course ?? 'SCM'
			query.distance = body.distance ?? "25M"
			if (body.discipline == 'BRUW') {
				delete query.timeStamp;
				delete query.distance;
			}
			console.log("-----> body.discipline: ", body.discipline, "query.timeStamp: ", query.timeStamp);
		}
		delete query.masters;

		// const limit = body.limit ? Number(body.limit) : 10;
		// const skip = body.page ? (Number(body.page)-1) * limit : 0;
// console.log("query=", query, "body=", body);

		const limit = body.limit ? Number(body.limit) : 100;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		// eliteAgeGroup
		if (body.ageGroup == undefined || body.ageGroup == '') {
			result = await LeaderboardModel.listRealtime(query, limit, skip);
		} else {
			query.ageGroup = eliteAgeGroup(body);
			result = await LeaderboardModel.listRealtimeElite(query, limit, skip);
		}
		// return await LeaderboardModel.listRealtime(query, limit, skip);
		result.data.times = result.data.times.reduce((arr, el) => {
			const tms = el.time.split(':')
			if (tms.length > 1 && tms[0].length == 1) {
				tms[0] = "0" + tms[0]
				el.time = tms.join(':')
			}
			arr.push(el);
			return arr;
		}, []);
		console.log("111 query=", query, result.data.times.length);
		return result;
	}
}

module.exports = LeaderboardServices;