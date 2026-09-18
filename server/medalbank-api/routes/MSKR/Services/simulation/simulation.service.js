const SimulationModel		= require("./simulation.model");
const SimulationBuild		= require("./simulation.build");
const utilError		= require("../../Util/utilError");

const group_max_row = 5;
const post_before = 5;
const post_after = 5;

class SimulationServices {

	static async create() {
		//-----------------------------------------
		return await SimulationModel.create();
		//-----------------------------------------
	}

	static async competitions(body) {
		console.log("simulation.competitions.body=", );
		try{
			const result = await SimulationModel.competitions(body);
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","simulation", "list", "catch." + err.message);
		}
	}

	static async list(body) {
		console.log("services.simulation.list.body=", body);
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service","simulation", "list", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","simulation", "list", "competitionID not numbers");
			const result = await SimulationModel.list(body);
			return result;
		} catch (err) {
			return utilError.errorMSG("Service","simulation", "list", "catch." + err.message);
		}
	}
	
	static async build(body) {
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service","simulation", "build", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","simulation", "build", "competitionID not numbers");
			//-----------------------------------------
			return await SimulationModel.build(body);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","simulation", "build", "catch." + err.message);
		}
	}

	static async delete(body) {
		try{
			if (!body.competitionID				) return utilError.errorMSG("Service","simulation", "delete", "competitionID not found");
			if (isNaN(body.competitionID)	) return utilError.errorMSG("Service","simulation", "delete", "competitionID not numbers");
			//-----------------------------------------
			return await SimulationModel.delete(body.competitionID);
			//-----------------------------------------
		} catch (err) {
			return utilError.errorMSG("Service","simulation", "delete", "catch." + err.message);
		}
	}
}

module.exports = SimulationServices;