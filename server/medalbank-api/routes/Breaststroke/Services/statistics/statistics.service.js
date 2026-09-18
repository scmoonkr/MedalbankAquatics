const StatisticsModel= require("./statistics.model");

const utilError		= require("../../Class/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class StatisticsServices {

	static async statistics(body) {
		// console.log("statics.statistics.body=", body);
		// try{
			return await StatisticsModel.statistics(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","statistics", "labs", "catch." + err.message);
		// }
	}
	static async buildStatistics(body) {
		// console.log("statics.buildStatistics.body=", body);
		try{
			return await StatisticsModel.buildStatistics(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","buildStatistics", "labs", "catch." + err.message);
		}
	}
	
	static async hallOfFame(body) {
		// console.log("statics.main.body=", body);
		try{
			return await StatisticsModel.hallOfFame(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "labs", "catch." + err.message);
		}
	}
//####################################################################
//########## Confirm #################################################
//####################################################################

}

module.exports = StatisticsServices;