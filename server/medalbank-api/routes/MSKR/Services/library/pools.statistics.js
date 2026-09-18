const _    				= require('lodash');
const extend 			= require('node.extend');
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");

const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

const MemoryDB 		= require('../../Class/MemoryDB');
const memoryDB		= new MemoryDB();

const UtilDate		= require("../../Class/DateLibrary");
const utilDate		= new UtilDate();

const TimeLibrary		= require("./times.library");

//-----------------------------------------------
//	build pools
//-----------------------------------------------
exports.getTimesStatistics = async (query) => {
	const poolStats = {};
	try {
		const now = new Date();

		// Helpers for date range calculations
		const startOfYear = new Date(now.getFullYear(), 0, 1);
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday of this week
		const startOfDay = new Date(now);
		startOfDay.setHours(0, 0, 0, 0);
		console.log("getTimesStatistics=", query);

		// Aggregate query
		const aggregate = [
			{ $match: query },
			{
				$group: {
					_id: {
						poolID		: "$poolID",
						style			: "$style",
						year			: { $year: "$datetime" },
						month			: { $month: "$datetime" },
						week			: { $week: "$datetime" },
						dayOfWeek	: { $dayOfWeek: "$datetime" }, // 1 (Sunday) to 7 (Saturday)
					},
					count: { $sum: 1 },
				},
			},
			{
				$group: {
					_id: "$_id.poolID",
					total: {
						$sum: "$count",
					},
					styles: {
						$push: {
							style			: "$_id.style",
							count			: "$count",
							year			: "$_id.year",
							month			: "$_id.month",
							week			: "$_id.week",
							dayOfWeek	: "$_id.dayOfWeek",
						},
					},
				},
			},
		];
		const result = await mongodb.aggregate(mongoCFG.Medalbank.times, aggregate);


		// Processing result into desired format
		result.data.forEach(pool => {
			const poolID = pool._id;
			poolStats[poolID] = {
				total			: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				thisYear	: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				thisMonth	: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				thisWeek	: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				mon: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				tue: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				wed: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				thi: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				fri: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				sat: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
				sun: { total: 0, freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0, individualMedley: 0, freestyleRelay: 0, medleyRelay: 0 },
			};

			pool.styles.forEach(style => {
				const { year, month, week, dayOfWeek, count } = style;

				// Update totals
				poolStats[poolID].total.total += count;
				poolStats[poolID].total[style.style] += count;

				// This year
				if (year === now.getFullYear()) {
					poolStats[poolID].thisYear.total += count;
					poolStats[poolID].thisYear[style.style] += count;
				}

				// This month
				if (year === now.getFullYear() && month === now.getMonth() + 1) {
					poolStats[poolID].thisMonth.total += count;
					poolStats[poolID].thisMonth[style.style] += count;
				}

				// This week
				if (year === now.getFullYear() && week === Math.ceil((now - startOfYear) / (7 * 24 * 60 * 60 * 1000))) {
					poolStats[poolID].thisWeek.total += count;
					poolStats[poolID].thisWeek[style.style] += count;
				}

				// Weekday stats
				const dayKey = ["sun", "mon", "tue", "wed", "thi", "fri", "sat"][dayOfWeek - 1];
				poolStats[poolID][dayKey].total += count;
				poolStats[poolID][dayKey][style.style] += count;
			});
		});
		
		// console.log(poolStats);
	} catch (error) {
		console.error("Error:", error);
	} finally {
		// await client.close();
	}
	return poolStats;
}