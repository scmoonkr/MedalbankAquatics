// const xlsx        = require('xlsx');
const utilLibrary = require("../Util/utilLibrary");
const excelLibrary= require('../Util/excelLibrary');
const excel	      = new excelLibrary();

const filename = "E:/OneDrive/Document/00. MSK/Design/modeling 20220820.xlsx";

(async () => {
	let sheet = "tags";
	if (process.argv.length >= 3) sheet = process.argv[2];
	const Sheet = sheet.slice(0, 1).toUpperCase() + sheet.slice(1);
	// console.log("sheet=", sheet, Sheet);

	//-----> read Excel
	let result = await excel.read_excel(filename, sheet);

	//-----> parse model
	let models = parseModel(result);
	// console.log(models);

	//-----> build data
	result = buildData(models);
// console.log(result);

	//-----> build data
	result = buildProject(models);
	// console.log(result);

	//-----> build data
	result = buildCustomizingDetail(models);
	// console.log(result);

	//-----> build data
	result = buildCustomizingDetail1(models);
	// console.log(result);

	//-----> build data
	result = buildClass_1(models, Sheet);
	// console.log(result);
	
	//-----> build data
	result = buildClass_2(models, Sheet);
	// console.log(result);
	
	//-----> build data
	result = buildClass_3(models, Sheet);
	// console.log(result);
	
	//-----> build data
	result = buildClass_4(models, Sheet);
	// console.log(result);
	
	//-----> build data
	result = buildClass_5(models, Sheet);
	// console.log(result);
	
	//-----> build data
	result = buildClass_6(models, Sheet);
	console.log(result);

})();

//=====================================================
function buildClass_6(models, className) {
	let data = "";


	models.forEach(model => {
		let obj = "";
		switch (model.type) {
			case "int":
				obj += `\t${model.name}: data.${model.name} || 0;\n`;
				break;
			case "bool":
				obj += `\t${model.name}: data.${model.name} || true;\n`;
				break;
			case "String":
				obj += `\t${model.name}: data.${model.name} || '';\n`;
				break;
			case "num":
				obj += `\t${model.name}: data.${model.name} || 0.0;\n`;
				break;
		}
		// data.push(obj);
		data += obj;
	})

	return data;
}
//=====================================================
function buildClass_5(models, className) {
	let data = "";
	data += `static ${className} initialize() {\n`;
	data += `\t${className} data = ${className};\n`;


	models.forEach(model => {
		let obj = "";
		switch (model.type) {
			case "int":
				obj += `\tdata.${model.name} = 0;\n`;
				break;
			case "bool":
				obj += `\tdata.${model.name} = true;\n`;
				break;
			case "String":
				obj += `\tdata.${model.name} = '';\n`;
				break;
			case "num":
				obj += `\tdata.${model.name} = 0.0;\n`;
				break;
		}
		// data.push(obj);
		data += obj;
	})
	data += "};\n";

	return data;
}
//=====================================================
function buildClass_4(models, className) {
	let data = "";

	data += "Map<String, dynamic> toJson() {\n";
  data += "\tfinal Map<String, dynamic> data = new Map<String, dynamic>();\n";
	data += "\n";


	models.forEach(model => {
		data += `\tdata['${model.name}'] = this.${model.name};\n`;
	})
	data += "};\n";

	return data;
}
//=====================================================
function buildClass_3(models, className) {
	let data = "";
	data += `${className}.fromJson(Map<String, dynamic> json) {\n`;

	//userNo = json['userNo'] || 0;

	models.forEach(model => {
		let obj = "";
		switch (model.type) {
			case "int":
				obj += `\t${model.name} = json['${model.name}'] || 0;\n`;
				break;
			case "bool":
				obj += `\t${model.name} = json['${model.name}'] || true;\n`;
				break;
			case "String":
				obj += `\t${model.name} = json['${model.name}'] || '';\n`;
				break;
			case "num":
				obj += `\t${model.name} = json['${model.name}'] || 0.0;\n`;
				break;
		}
		// data.push(obj);
		data += obj;
	})
	data += "};\n";

	return data;
}
//=====================================================
function buildClass_2(models, className) {
	let data = "";
	data += `${className}({\n`;

	//if (data.userNo != undefined) value = Number(data.userNo);

	models.forEach(model => {
		let obj = "";
		switch (model.type) {
			case "int":
				obj += `\tthis.${model.name} = 0,\n`;
				break;
			case "bool":
				obj += `\tthis.${model.name} = true,\n`;
				break;
			case "String":
				obj += `\tthis.${model.name} = '',\n`;
				break;
			case "num":
				obj += `\tthis.${model.name} = 0.0,\n`;
				break;
		}
		// data.push(obj);
		data += obj;
	})
	data += "});\n";

	return data;
}
//=====================================================
function buildClass_1(models, className) {
	let data = "";
	data += `class ${className} {\n`;

	//if (data.userNo != undefined) value = Number(data.userNo);

	models.forEach(model => {
		let obj = "";
		switch (model.type) {
			case "int":
				obj += `\tint ${model.name} = 0;\n`;
				break;
			case "bool":
				obj += `\tbool ${model.name} = true;\n`;
				break;
			case "String":
				obj += `\tString ${model.name} = '';\n`;
				break;
			case "num":
				obj += `\tnum ${model.name} = 0.0;\n`;
				break;
		}
		// data.push(obj);
		data += obj;
	})
	data += "}\n";

	return data;
}
//=====================================================
function buildCustomizingDetail1(models) {
	let data = "";
	data += "const value = {};\n";

	//if (data.userNo != undefined) value = Number(data.userNo);

	models.forEach(model => {
		let obj = `\tif (data.${model.name} != undefined) value = `;
		switch (model.type) {
			case "int":
				obj += `Number(data.${model.name});`;
				break;
			case "bool":
				obj += `data.${model.name};`;
				break;
			case "String":
				obj += `data.${model.name};`;
				break;
			case "num":
				obj += `data.${model.name};`;
				break;
		}
		obj += "\n";
		// data.push(obj);
		data += obj;
	})
	data += "}\n";

	return data;
}
//=====================================================
function buildCustomizingDetail(models) {
	let data = "";
	data += "const value = {\n";
		
	models.forEach(model => {
		let obj = `\t${model.name}:\t`;
		switch (model.type) {
			case "int":
				obj += `data.${model.name} || 0,`;
				break;
			case "bool":
				obj += `data.${model.name} || true,`;
				break;
			case "String":
				obj += `data.${model.name} || '',`;
				break;
			case "num":
				obj += `data.${model.name} || 0.0,`;
				break;
		}
		obj += "\n";
		// data.push(obj);
		data += obj;
	})
	data += "}\n";

	return data;
}
//=====================================================
function buildProject(models) {
	let data = [];
	models.forEach(model => {
		let obj = `${model.name}:1,\n`;
		// data.push(obj);
		data += obj;
	})

	return data;
}
//=====================================================
function buildData(models) {
	let data = [];
	models.forEach(model => {
		let obj = `${model.name}:\t`;
		switch (model.type) {
			case "int":
				obj += "0,";
				break;
			case "bool":
				obj += "true,";
				break;
			case "String":
				obj += "'',";
				break;
			case "num":
				obj += "0.0,";
				break;
		}
		obj += "\n";
		// data.push(obj);
		data += obj;
	})

	return data;
}
//=====================================================
function parseModel(records) {
	let objName = [];
	let no = 0;
	Object.keys(records[0]).forEach(key => {
		objName[no++] = { key: key, name: records[0][key] };
	})

	objName = objName.splice(0, 7);
	// console.log(objName);

	let models = [];
	let old = "";
	for (let no = 1; no < records.length; no++) {
		const obj = {};

		objName.forEach(el => {
			obj[el.name] = records[no][el.key] || "";
		})
		if (obj.category != "") old = obj.category;

		if (obj.name == "" && obj.category != "") {
			obj.name = obj.category;
			obj.category = ""
		}
		if (obj.category == "") obj.category = old;
		if (obj.name == obj.category) obj.category = "";

		obj.array = false;
		if (obj.name.slice(-2) == "[]") {
			obj.array = true;
			obj.name = obj.name.slice(0, -2);
		}
		
		if (obj.name != "") models.push(obj);
	}
	return models;
}