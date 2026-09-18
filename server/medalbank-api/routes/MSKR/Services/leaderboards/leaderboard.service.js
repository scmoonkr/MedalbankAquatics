const LeaderboardModel	= require("./leaderboard.model.js");
const utilError					= require("../../Util/utilError");
const UtilDate					= require("../../Class/DateLibrary.js");
const utilDate					= new UtilDate();

const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const TimeLibrary	= require("../../Class/TimeLibrary");
const {eliteAgeGroup} = require("../../Util/swimmingLibrary");
const timeLibrary = new TimeLibrary();

const timeLimit = 100;
const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class LeaderboardServices {

	static async create() {
		//-----------------------------------------
		return await LeaderboardModel.create();
		//-----------------------------------------
	}


	// list
	static async list(body) {
		body.limit = body.limit || 100;
		let result = { message: "", data: [] };
		// console.log("leaderboard.service.listRealtime.body:", body);
		// try {
			// Required fields validation
			const requiredFields = ['gender', 'style', 'course', 'distance'];
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
			if (body.gender		) query.gender		= body.gender;
			if (body.style		) query.style			= body.style;
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
	// 	style: 'freestyle',
	// 	distance: '50M',
	// 	course: 'LCM',
	// 	ageGroup: '00',
	// 	sido: '전국',
	// 	dateType: 'all',
	// 	page: 1,
	// 	limit: '200'
	// }
	static async listRealtime(body) {
		console.log("listRealtime.body=", body);
		let result;
		if (body.sido) {
			body.sido = body.sido.replace("전국", '');
		}
		if (body.ageGroup) {
			body.ageGroup = body.ageGroup.replace("00", '');
		}

		const query = {
			timeStamp			: { $gt: 0 },
			// type					: "event",	// time | event | club
			// isMasters			: true,
			// isAdult				: true,
		}

		// all|year|month|week|day|period
		if (body.group	 	) {
			const dateQuery = mongodb.makeDateQuery(body.type, body.date, body.dateTo);
			if (Object.keys(dateQuery).length > 0) query.datetime = dateQuery;
		}

		// style
		if (body.masters 	) query.isMasters	= body.masters == "비등록";
		if (body.adult && body.adult != "전체") query.isAdult		= body.adult == "성인";
		if (body.style	 	) query.style			= body.style;
		if (body.gender	 	) query.gender		= body.gender;
		if (body.course	 	) query.course		= body.course;
		if (body.distance	) query.distance	= body.distance;
		if (body.ageGroup	) query.ageGroup 	= body.ageGroup;
		if (body.sido		 	) query.sido			= body.sido;
		if (body.typeTime )	query.type 			= body.typeTime.replace("Result", "");
			delete query.masters;

		// const limit = body.limit ? Number(body.limit) : 10;
		// const skip = body.page ? (Number(body.page)-1) * limit : 0;
// console.log("query=", query, "body=", body);

		const limit = body.limit ? Number(body.limit) : 100;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		// eliteAgeGroup
		if (body.ageGroup == undefined || body.ageGroup == '') {
			result = LeaderboardModel.listRealtime(query, limit, skip);
		} else {
			query.ageGroup = eliteAgeGroup(body);
			result = LeaderboardModel.listRealtimeElite(query, limit, skip);
		}
		// return await LeaderboardModel.listRealtime(query, limit, skip);
		console.log("query=", query);
		return result;
	}
	static async list4Capture(body) {
		console.log("list4Capture.body=", body);
		let result = LeaderboardModel.list4Capture(body);
		return result;
	}

//######################################################################
//############################ Confirm #################################
//######################################################################
	static async detail(body) {
		console.log("leaderboard.detail.body=", body);
		try{
			if (!body.LID				) return utilError.errorMSG("Service","leaderboard", "detail", "LID not found");
			if (isNaN(body.LID)	) return utilError.errorMSG("Service","leaderboard", "detail", "LID not numbers");
			//-----------------------------------------
			return await LeaderboardModel.detail(body.LID);
			//-----------------------------------------			return result;
		} catch (err) {
			return utilError.errorMSG("Service","leaderboard", "detail", "catch." + err.message);
		}
	}
	// times_medalbank에서 가져옴
	static async listRealtimeOLD(body) {
		let result = { message: "", data: [] };
		console.log("leaderboard.service.listRealtimeOLD.body:", body);
		// try {
			// Required fields validation
			const requiredFields = ['gender', 'style', 'course', 'distance'];
			for (let field of requiredFields) {
				if (!body[field]) {
					return utilError.errorMSG("Service", "leaderboard", "list", `${field} not found`);
				}
			}
	
			// Build base query object
			const query = {};
			if (body.name			) query.name			= new RegExp(body.name, 'gi');
			if (body.typeTime	) query.type			= body.typeTime.replace("Result", '');
			if (body.gender		) query.gender		= body.gender;
			if (body.style		) query.style			= body.style;
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

		const limit = body.limit ? Number(body.limit) : 10000;
		
		// Handle `group` based queries and determine `realtime`
			let realtime = false;
			if (body.group) {
				const parsedDate = body.date ? body.date.split('-').map(Number) : [];
				switch (body.group) {
					//-----
					case "all":
						// Object.assign(query, { year: parsedDate[0] || year, group: "year" });
						result = await LeaderboardModel.listRealtime(query, limit);
						break;
					//-----
					case "year":
						query['$expr'] = {
							$eq: [
								{ $year: "$datetime" }, Number(body.year),
							]
						}; // datetime의 연도가 2023인지 확인
						result = await LeaderboardModel.listRealtime(query, limit);
						break;
					//-----
					case "month":
						query['$expr'] = {
							$and: [
								{ $eq: [{ $year: "$datetime" }, Number(body.year)] },
								{ $eq: [{ $month: "$datetime" }, Number(body.month)] }
							]
						}; // datetime의 year, month 인지 확인
						result = await LeaderboardModel.listRealtime(query, limit);
						break;
					//-----
					case "lastWeek":
						const { start, end } = utilDate.getLastWeek();
						Object.assign(query, { datetime: { $gte: start, $lt: end } });
						result = await LeaderboardModel.listRealtime(query, limit);
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
						result = await LeaderboardModel.listRealtime(query, limit);
						// result = await LeaderboardModel.list(query, body);
						break;
					//-----
					case "thisYear":
						query['$expr'] = {
							$eq: [
								{ $year: "$datetime" }, year,
							]
						}; // datetime의 연도가 2023인지 확인
						result = await LeaderboardModel.listRealtime(query, limit);
						break;
					//-----
					case "thisMonth":
						query['$expr'] = {
							$and: [
								{ $eq: [{ $year: "$datetime" }, year] },
								{ $eq: [{ $month: "$datetime" }, month] }
							]
						}; // datetime의 year, month 인지 확인
						result = await LeaderboardModel.listRealtime(query, limit);
						break;
					//-----
					case "week":
						// query.startDate = getStartOfWeek(today);
						// query.endDate = endDate;
						today = new Date(getStartOfWeek(today));
						today.setHours(9,0,0,0); // set timezone: +9(Korean)
						const {	start1, end1 } = utilDate.getThisWeek();
						query.datetime = { $gte: start1, $lt: end1 };
						result = await LeaderboardModel.listRealtime(query, limit);
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
						result = await LeaderboardModel.listRealtime(query, limit);
						break;
				} // end switch
			}	else {
				// query.datetime = { $gte: new Date(year, 0, 1, 9, 0, 0, 0), $lt: endDate };
				// result = await LeaderboardModel.listRealtime(query, body.limit);
				// result = await LeaderboardModel.list(query, body);
				result = await LeaderboardModel.listRealtime(query, limit);
			}

			const timeIDs = [...new Set(result.data.times.map((item) => item.timeID))];
			// console.log("timeIDs=", timeIDs);

			const context = {
				query			: { timeID: { $in: timeIDs }, },
				projection: { _id:0, timeID:1, athleteID:1 },
				limit			: 200000,
				skip			: 0,
				// sort 			: { datetime: 1, }
			}
			const athlete = await mongodb.find(mongoCFG.Medalbank.times, context);
			// console.log("----->", athlete.data);
			result.data.times = timeLibrary.updateAthleteIDs(result.data.times, athlete.data);

			console.log("old-----> leaderboard: ", result.data.times[0]);
			return result;		
			
		// } catch (err) {
		// 	result = utilError.errorMSG("Service", "leaderboard", "list", `catch. ${err.message}`);
		// }
	}

	static async listXXX(body) {
		console.log("leaderboard.service.list.body:", body);
		// try {
			// Required fields validation
			const requiredFields = ['gender', 'style', 'course', 'distance'];
			for (let field of requiredFields) {
				if (!body[field]) {
					return utilError.errorMSG("Service", "leaderboard", "list", `${field} not found`);
				}
			}
	
			// Build base query object
			const query = {
				gender: body.gender,
				style: body.style,
				course: body.course,
				distance: body.distance,
			};
	
			// Additional query fields
			if (body.sido && body.sido !== "전국") query.sido = body.sido;
	
			// Age group handling
			if (body.ageGroup && body.ageGroup !== "00") {
				query.ageGroup = body.ageGroup === "09" 
					? { $in: ["01", "03", "05"] }  // 학생 group
					: body.ageGroup === "10" 
					? { $gte: "11" }  // 성인 group
					: body.ageGroup;
			}
	
			// Group handling
			if (body.group && body.group !== "all") {
				body.group = body.group.split('-')[0];
			}
	
			// Name handling
			if (body.name) {
				query.name = new RegExp(body.name.trim(), "gi");
			} else {
				query['$or'] = [{ deleted: { $exists: false } }, { deleted: "" }];
			}
			if (body.ageGroup) query.ageGroup = body.ageGroup;
			if (body.sido		 ) query.sido			= body.sido;

			// Current date variables
			let today = new Date();
			today.setHours(9,0,0,0); // set timezone: +9(Korean)
			let endDate = new Date(today);  // today의 복사본 생성
			endDate.setDate(today.getDate() + 1);  // 날짜에 1을 더해 다음 날로 설정
			const [year, month, day, week] = [
				today.getFullYear(),
				today.getMonth(),
				today.getDate(),
				utilDate.getWeekOfMonth(today)
			];
			// query.datetime	= { $gte: startDate, $lt: endDate }

		const limit = body.limit ? Number(body.limit) : 10000;

		// Handle `group` based queries and determine `realtime`
			let realtime = false;
			if (body.group) {
				const parsedDate = body.date ? body.date.split('-').map(Number) : [];
				switch (body.group) {
					case "all":
						// Object.assign(query, { year: parsedDate[0] || year, group: "year" });
						// return await LeaderboardModel.list(query, body);
						return await LeaderboardModel.listRealtime(query, limit);

						
						// query.datetime = { $gte: new Date(year, 0, 1, 9, 0, 0, 0), $lt: endDate };
						// return await LeaderboardModel.listRealtime(query, body.limit);
					case "year":
						Object.assign(query, { year: parsedDate[0] || year, group: "year" });
						// return await LeaderboardModel.list(query, body); 
						return await LeaderboardModel.listRealtime(query, limit);
						case "month":
						Object.assign(query, { year: parsedDate[0], month: parsedDate[1], group: "month" });
						// return await LeaderboardModel.list(query, body);
						return await LeaderboardModel.listRealtime(query, limit);
						case "lastWeek":
						Object.assign(query, { year: parsedDate[0], month: parsedDate[1], week: parsedDate[2], group: "week" });
						return await LeaderboardModel.listRealtime(query, limit);
						// return await LeaderboardModel.list(query, body);
					case "yesterday":
						Object.assign(query, { year: parsedDate[0], month: parsedDate[1], day: parsedDate[2], group: "day" });
						return await LeaderboardModel.listRealtime(query, limit);
						// return await LeaderboardModel.list(query, body);
					case "thisYear":
						query.datetime = { $gte: new Date(year, 0, 1, 9, 0, 0, 0), $lt: endDate };
						return await LeaderboardModel.listRealtime(query, limit);
						break;
					case "thisMonth":
						// query.startDate = new Date(year, month, 1);
						// query.endDate = endDate;
						query.datetime = { $gte: new Date(year, month, 1, 9, 0, 0, 0), $lt: endDate };
						return await LeaderboardModel.listRealtime(query, limit);
						case "week":
						// query.startDate = getStartOfWeek(today);
						// query.endDate = endDate;
						today = new Date(getStartOfWeek(today));
						today.setHours(9,0,0,0); // set timezone: +9(Korean)
						query.datetime = { $gte: today, $lt: endDate };
						return await LeaderboardModel.listRealtime(query, limit);
						break;
					case "today":
						// Object.assign(query, { year, month, day, group: "day" });
						// query.startDate = today;
						// query.endDate = endDate;
						query.datetime = { $gte: today, $lt: endDate };
						return await LeaderboardModel.listRealtime(query, limit);
						break;
				}
			}	else {
				// query.datetime = { $gte: new Date(year, 0, 1, 9, 0, 0, 0), $lt: endDate };
				// return await LeaderboardModel.listRealtime(query, body.limit);
				// return await LeaderboardModel.list(query, body);
				return await LeaderboardModel.listRealtime(query, limit);
			}				
			
		// } catch (err) {
		// 	return utilError.errorMSG("Service", "leaderboard", "list", `catch. ${err.message}`);
		// }
	}
	
	static async listMy(body) {
		try{
			if 			(!body.gender		)	return utilError.errorMSG("Service","leaderboard", "list", "gender not found");
			else if (!body.style		)	return utilError.errorMSG("Service","leaderboard", "list", "style not found");
			else if (!body.course		)	return utilError.errorMSG("Service","leaderboard", "list", "course not found");
			else if (!body.distance	)	return utilError.errorMSG("Service","leaderboard", "list", "distance not found");

			const query = {
				gender	: body.gender,
				style		: body.style,
				course	: body.course,
				distance: body.distance,
			};

			if (body.sido && body.sido != "전국") query.sido = body.sido;
			if (body.ageGroup && body.ageGroup != "00") {
				if 			(body.ageGroup == "09") query.ageGroup = { $in: ["01", "03", "05"]};	// check 학생			
				else if (body.ageGroup == "10") query.ageGroup = { $gte: "11"};	// check 성인
				else 		query.ageGroup = body.ageGroup;
			}
			if (body.group && body.group != "all") {
				body.group = body.group.split('-')[0];
			}
			if (body.name)	 {
				query.name = new RegExp(body.name.trim(), "gi");
			} else {
				query['$or'] = [ { deleted: { $exists: false } }, { deleted	: "" } ];
			}
			console.log("~~~~~~~~~~~~~~~~~~~", query);
			let arr;
			let realtime = false;
			const today = new Date();
			const year = today.getFullYear();
			const month = today.getMonth()+1;
			const day = today.getDate();
			const week = utilDate.getWeekOfMonth(today);
			switch (body.group) {
				case "thisYear":
					realtime = true;
					query.year = year;
					query.group = "year";
					break;
				case "year":
					query.group = body.group;
					query.year = Number(body.date);
					if (query.year == year) realtime = true;
					break;
				case "thisMonth":
					realtime = true;
					query.year = year;
					query.month = month;
					query.group = "month";
					break;
				case "month":
					arr = body.date.split('-');
					query.year = Number(arr[0]);
					query.month = Number(arr[1]);
					query.group = body.group;
					if (query.year == year && query.month == month) realtime = true;
					break;
				case "week":
					query.year = year;
					query.month = month;
					query.week = week;
					if (query.year == year && query.month == month && query.week == week) realtime = true;
					break;
				case "lastWeek":
					arr = body.date.split('-');
					query.year = Number(arr[0]);
					query.month = Number(arr[1]);
					query.week = Number(arr[2]);
					query.group = 'week';
					break;
				case "today":
					query.year = year;
					query.month = month;
					query.day = day;
					query.group = 'day';
					realtime = true;
				case "yesterday":
					arr = body.date.split('-');
					query.year = Number(arr[0]);
					query.month = Number(arr[1]);
					query.day = Number(arr[2]);
					query.group = 'day';
					break;
			}
			return realtime 
							? await LeaderboardModel.listRealtime(query, body)
							: await LeaderboardModel.listRealtime(query, body);
		} catch (err) {
			return utilError.errorMSG("Service","leaderboard", "list", "catch." + err.message);
		}
	
	}

	//------------------------------------------
	//  leaderboard_medalbank
	//     group: 'year|month|week|day'
	//     datetime:
	//       year  - year: '2024'
	//       month - year: '2024', month:'01'
	//       week  - year: '2024', month:'01', week: '1'
	//       day   - year: '2024', month:'01', day: '1'
	//------------------------------------------
	static buildDatetimeQuery (body) {
		let startDate, endDate;
		switch (group) {
			case "year":
				//----------------------------------
				//  year
				//----------------------------------
				startDate = new Date(`${year}-01-01T00:00:00.000Z`);
				endDate   = new Date(`${year}-12-31T23:59:59.999Z`);
				break;
			case "month":
				//----------------------------------
				//  year-month
				//----------------------------------
				startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
				endDate   = new Date(new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`).setMonth(startDate.getMonth() + 1) - 1);  // 해당 월의 마지막 날
				break;
			case "week":
				//----------------------------------
				//  year-month-week
				//----------------------------------
				startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
				const weekStart = new Date(startDate.setDate((week - 1) * 7 + 1)); // week번째 주 시작
				const weekEnd = new Date(weekStart);
				weekEnd.setDate(weekStart.getDate() + 6); // 주의 끝 날짜
				startDate = weekStart;
				endDate = new Date(weekEnd.setHours(23, 59, 59, 999)); // 주의 마지막 날의 끝
				break;
			case "day":
				//----------------------------------
				//  year-month-day
				//----------------------------------
				startDate = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`);
				endDate   = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T23:59:59.999Z`);
				break;
		}
		const query = { datetime: {
				$gte: startDate,
				$lt:  endDate
			}
		}
		return query;
	}
	// year, month, day
	static async listBrief(body) {
		console.log("leaderboard.listBrief.body=", body);
		if (body.year == undefined)	return utilError.errorMSG("Service","leaderboard", "listBrief", "year not found");
		if (isNaN(body.year)) 			return utilError.errorMSG("Service","leaderboard", "listBrief", "year not number");
		
		// try {
			const today = new Date();
			const year = Number(body.year);
			let month = Number(body.month);

			const group = body.group.split('-')[0];
			console.log("listBrief.group=", group);
			switch (group) {
				case "thisYear":
				case "year":
					if (year == 0) return await LeaderboardModel.listBriefYear(year);
					if (year < today.getFullYear) return await LeaderboardModel.listBriefYearBatch(year);
					// 올해의 leaderboard
					//----------------------------------
					// 올해면 times에서 읽어서 leaderboard 반환
					//----------------------------------
					if (year == today.getFullYear() && (month-1) == today.getMonth()) {
						return await LeaderboardModel.listBriefThisYear(body);
					} else {
						//----------------------------------
						// 올해가 아니면 leaderboards에서 읽어서 leaderboard 반환
						//----------------------------------
						return await LeaderboardModel.listBriefYear(body);
					}
				case "thisMonth":
				case "month":
					if (body.month == undefined)		return utilError.errorMSG("Service","leaderboard", "listBrief.month", "month not found");
					if (isNaN(body.month))					return utilError.errorMSG("Service","leaderboard", "listBrief.month", "month not number");
					if ((month-1) < today.getMonth) return await LeaderboardModel.listBriefMonthBatch(year, month);
					//----------------------------------
					// 이번 달 이면 times에서 읽어서 leaderboard 반환
					//----------------------------------
					if (year == today.getFullYear() && (month-1) == today.getMonth()) {
						return await LeaderboardModel.listBriefThisMonth(body);
					} else {
						//----------------------------------
						// 이번 달이 아니면 leaderboards에서 읽어서 leaderboard 반환
						//----------------------------------
						return await LeaderboardModel.listBriefMonth(body);
					}
				case "thisWeek":
				case "week":
					if (body.month == undefined)	return utilError.errorMSG("Service","leaderboard", "listBrief.week", "month not found");
					if (isNaN(body.month))				return utilError.errorMSG("Service","leaderboard", "listBrief.week", "month not number");
					if (body.week == undefined)		return utilError.errorMSG("Service","leaderboard", "listBrief.week", "week not found");
					if (isNaN(body.week))					return utilError.errorMSG("Service","leaderboard", "listBrief.week", "week not number");
					const week = Number(body.week);
					//----------------------------------
					// 이번주 이면 times에서 읽어서 leaderboard 반환
					//----------------------------------
					if (year == today.getFullYear() &&
							(month-1) == today.getMonth() && // month는 0~11
							week == utilDate.getWeekOfMonth(today)) {
						return await LeaderboardModel.listBriefThisWeek(body);
					} else {
						//----------------------------------
						// 이번주가 아니면 leaderboards에서 읽어서 leaderboard 반환
						//----------------------------------
						return await LeaderboardModel.listBriefWeek(body);
					}
				case "today":
				case "yesterday":
				case "day":
					if (body.month == undefined)	return utilError.errorMSG("Service","leaderboard", "listBrief.day", "month not found");
					if (isNaN(body.month))				return utilError.errorMSG("Service","leaderboard", "listBrief.day", "month not number");
					if (body.day == undefined)		return utilError.errorMSG("Service","leaderboard", "listBrief.day", "day not found");
					if (isNaN(body.day))					return utilError.errorMSG("Service","leaderboard", "listBrief.day", "day not number");
					month = Number(body.month);
					const day = Number(body.day);
					//----------------------------------
					// 오늘 날짜 이면 times에서 읽어서 leaderboard 반환
					//----------------------------------
					if (year == today.getFullYear() && (month-1) == today.getMonth() && day == today.getDate()) {
						return await LeaderboardModel.listBriefToday(body);
					} else {
						//----------------------------------
						// 오늘 날짜가 아니면 leaderboards에서 읽어서 leaderboard 반환
						//----------------------------------
						return await LeaderboardModel.listBriefDay(body);
					}
				default:
					return utilError.errorMSG("Service","leaderboard", "listBrief", "group error." + body.group);
			}
		// } catch (err) {
		// 	return utilError.errorMSG("Service","leaderboard", "listBrief", "catch." + err.message);
		// }
	
	}
	static async listToday(body) {
		
		const today = "2024-09-08";
		return await LeaderboardModel.getLeaderboardToday(today);
	}
	static async listNow(body) {
		
		const today = "2024-09-08";
		return await LeaderboardModel.getLeaderboardRealtime(today);
	}

	static async build(body) {
		console.log("leaderboard.build.body=", body);
		try{
			if 			(!body.gender || !body.style || !body.distance || !body.course) return await LeaderboardModel.buildAll();

			const query = { gender: body.gender, style: body.style, distance: body.distance, course: body.course, };
			return await LeaderboardModel.build(query);
		} catch (err) {
			return utilError.errorMSG("Service","leaderboard", "list", "catch." + err.message);
		}
	}

	static async insert(body) {
		try{
			//-----------------------------------------
			return await LeaderboardModel.insert(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","leaderboard", "insert", "catch." + err.message);
		}
	}

	static async update(body) {
		try{
			if (!body.LID				) return utilError.errorMSG("Service","leaderboard", "update", "LID not found");
			if (isNaN(body.LID)	) return utilError.errorMSG("Service","leaderboard", "update", "LID not numbers");
			//-----------------------------------------
			return await LeaderboardModel.update(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","leaderboard", "update", "catch." + err.message);
		}
	}

	static async delete(body) {
		console.log("leaderboard.service.delete.body:", body);
		try{
			if (!body.LID				) return utilError.errorMSG("Service","leaderboard", "delete", "LID not found");
			// if (isNaN(body.LID)	) return utilError.errorMSG("Service","leaderboard", "delete", "LID not numbers");
			//-----------------------------------------
			return await LeaderboardModel.delete(body.LID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","leaderboard", "delete", "catch." + err.message);
		}
	}

	static async deletePermanent(body) {
		console.log("leaderboard.service.deletePermanent.body:", body);
		try{
			//-----------------------------------------
			return await LeaderboardModel.deletePermanent();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","leaderboard", "deletePermanent", "catch." + err.message);
		}
	}

	static async restore(body) {
		console.log("leaderboard.service.restore.body:", body);
		try{
			if (!body.deleted) return utilError.errorMSG("Service","leaderboard", "restore", "deleted not found");
			// if (isNaN(body.LID)	) return utilError.errorMSG("Service","leaderboard", "delete", "LID not numbers");
			//-----------------------------------------
			return await LeaderboardModel.restore(body.deleted);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","leaderboard", "restore", "catch." + err.message);
		}
	}
}

module.exports = LeaderboardServices;