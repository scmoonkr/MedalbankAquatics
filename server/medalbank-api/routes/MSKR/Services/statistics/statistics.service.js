const StaticModel= require("./statistics.model");

const utilError		= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class StaticServices {


	static async mainNew(body) {
		console.log("statics.mainNew.body=", body);
		try{
			return await StaticModel.mainNew();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "mainNew", "catch." + err.message);
		}
	}
	static async main(body) {
		// console.log("statics.main.body=", body);
		// try{
			return await StaticModel.main();
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","statics", "labs", "catch." + err.message);
		// }
	}
//####################################################################
//########## Confirm #################################################
//####################################################################

	static async rankings(body) {
		console.log("statics.rankings.body=", body);
		try{
			return await StaticModel.rankings();
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "rankings", "catch." + err.message);
		}
	}

	static clearMemory(body) {
		console.log("statics.clearMemory.body=", body);
		try{
			return StaticModel.clearMemory(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "labs", "catch." + err.message);
		}
	}

	static async loadMemory(body) {
		console.log("statics.loadMemory.body=", body);
		// try{
			return await StaticModel.loadMemory(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","statics", "labs", "catch." + err.message);
		// }
	}

	static async getStatistics(body) {
		console.log("statics.getStatistics.body=", body);
		// try{
			return await StaticModel.getStatistics(body);
			//-----------------------------------------
		// } catch (err) {
		// 	return utilError.errorMSG("Service","statics", "labs", "catch." + err.message);
		// }
	}

	static async getAthletesMemory(body) {
		console.log("statics.getAthletesMemory.body=", body);
		try{
			return await StaticModel.getAthletesMemory(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getAthletesMemory", "catch." + err.message);
		}
	}

	static getTimesMemory(body) {
		console.log("statics.getTimesMemory.body=", body);
		try{
			return StaticModel.getTimesMemory(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getTimesMemory", "catch." + err.message);
		}
	}

	static getTeamsMemory(body) {
		console.log("statics.getTeamsMemory.body=", body);
		try{
			return StaticModel.getTeamsMemory(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getTeamsMemory", "catch." + err.message);
		}
	}

	static async getPoolsMemory(body) {
		console.log("statics.getPoolsMemory.body=", body);
		try{
			return await StaticModel.getPoolsMemory(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getPoolsMemory", "catch." + err.message);
		}
	}

	static getCompetitionsMemory(body) {
		console.log("statics.getCompetitionsMemory.body=", body);
		try{
			return StaticModel.getCompetitionsMemory(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getCompetitionsMemory", "catch." + err.message);
		}
	}

	static async getMeasuredRecent(body) {
		console.log("statics.getMeasuredRecent.body=", body);
		try{
			return await StaticModel.getMeasuredRecent(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getMeasuredRecent", "catch." + err.message);
		}
	}

	static getMeasuredMost(body) {
		console.log("statics.getMeasuredMost.body=", body);
		try{
			return StaticModel.getMeasuredMost(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getMeasuredMost", "catch." + err.message);
		}
	}

	static async getSearchCount(body) {
		console.log("statics.getSearchCount.body=", body);
		try{
			return await StaticModel.getSearchCount(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getSearchCount", "catch." + err.message);
		}
	}

	static getSearchRecent(body) {
		console.log("statics.getSearchRecent.body=", body);
		try{
			return StaticModel.getSearchRecent(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getSearchRecent", "catch." + err.message);
		}
	}

	static async getJoined(body) {
		console.log("statics.getJoined.body=", body);
		try{
			return await StaticModel.getJoined(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","statics", "getJoined", "catch." + err.message);
		}
	}
}

module.exports = StaticServices;