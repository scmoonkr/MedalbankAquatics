const Model = require("./names.model");
const utilError	= require("../../Class/utilError");

class NameServices{

	static async list(body){
		try {
			if (!body.name && !body.type	) return utilError.errorMSG("Service","names", "list", "type, name not found !!");
			return await Model.list(body);
		} catch (err){
			return utilError.errorMSG("Service","names", "list", "catch." + err);
		}
	}

	static async getNames(body){
		try {
			if (!body.name    ) return utilError.errorMSG("Service","names", "getNames", "name not found !!");
			if (!body.type    ) return utilError.errorMSG("Service","names", "getNames", "type not found !!");
			return await Model.getNames(body);
		} catch (err){
			return utilError.errorMSG("Service","names", "getNames", "catch." + err);
		}
	}
	
	static async check(body){
		try {
			if (!body.name && !body.type	) return utilError.errorMSG("Service","names", "check", "type, name not found !!");
			return await Model.isExistsName(body);
		} catch (err){
			return utilError.errorMSG("Service","names", "check", "catch." + err);
		}
	}

	static async detail(body){
		try {
			if (!body.name    ) return utilError.errorMSG("Service","names", "detail", "name not found !!");
			if (!body.type    ) return utilError.errorMSG("Service","names", "detail", "type not found !!");

			return await Model.getByTypeNames(body.type, body.name);
		} catch (err){
			return utilError.errorMSG("Service","names", "detail", "catch." + err);
		}
	}

	static async insert(body){
		// try {
			if (!body.name) return utilError.errorMSG("Service","names", "insert", "name not found !!");
			if (!body.type) return utilError.errorMSG("Service","names", "insert", "type not found !!");
			return await Model.insert(body);
		// } catch (err){
		// 	return utilError.errorMSG("Service","names", "insert", "catch." + err);
		// }
	}

	static async update(body){
		try {
			if (!body.name    ) return utilError.errorMSG("Service","names", "update", "name not found !!");
			if (!body.type    ) return utilError.errorMSG("Service","names", "update", "type not found !!");
			// if (body.replace == undefined) body.replace = true;
			body.replace = body.replace || true;
			return await Model.update(body);
		} catch (err){
			return utilError.errorMSG("Service","names", "update", "catch." + err);
		}
	}

	static async delete(body){
		try {
			if (!body.name && !body.type	) return utilError.errorMSG("Service","names", "delete", "type, name not found !!");

			return await Model.delete(body.type, body.name);
		} catch (err){
			return utilError.errorMSG("Service","names", "delete", "catch." + err);
		}
	}

	static async create() {
    return await Model.create();
	}
}

module.exports = NameServices;