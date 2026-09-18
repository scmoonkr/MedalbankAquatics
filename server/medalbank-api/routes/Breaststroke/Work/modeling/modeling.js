const fs          = require('fs');
const xlsx        = require('xlsx');
const utilLibrary = require('../../medalbank/util/utilLibrary');
const excelLibrary= require('../../medalbank/class/ExcelLibrary');
const mongoCFG 		= require('../../medalbank/config/mongoCFG');
const mongoDB			= require('../../medalbank/class/MongoDB');
const UtilDate    = require("../../medalbank/class/DateLibrary");

const excel	      = new excelLibrary();
const utilDate	  = new UtilDate();
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

// const len = 3;
// const str = '#'.repeat(len);
// console.log(str);
// return;

const global = {}; 
let maxFieldLen = 0;
//----- home
let oneDrive 			= "E:\OneDrive"; 
global.mskrPath   = "f:/backup/MSKR";
global.KSF        = "f:/backup/KSF";

// oneDrive = "aaa"
if (! fs.existsSync(oneDrive + "/2. 2023")) {
	oneDrive 					= "C:/Users/ASUS/OneDrive"; 
	global.mskrPath   = "c:/backup/MSKR";
	global.KSF        = "c:/backup/KSF";
}
const sourcePath 					= oneDrive + "/5. 메달뱅크/Design";

const sheet = process.argv.length < 3 ? "users" : process.argv[2];
const filename = process.argv.length < 4 ? `${oneDrive}/5. 메달뱅크/Design/MedalBank modeling 20230202.xlsx` : process.argv[3];

console.log(`filename=${filename}, sheet=${sheet}`);

// name: "", len: n,
const fieldLength = {};

(async () => {

	let records, result;

// 	records = await readExcel(filename, sheet);
// console.log(records);
// 	return;


	const query = { collection: sheet };
	//------------------------------------------------------------------
	result = await mongodb.findOne(mongoCFG.Medalbank.modeling, query);
	//------------------------------------------------------------------
	if (true || !result.data.collection || result.data.records.length == 0) {
		//--------------------------------------------
		records = await readExcel(filename, sheet);
		//--------------------------------------------

		const value = {
			collection 	: sheet,
			records			: records,
		}
		//------------------------------------------------------------------
		result = await mongodb.updateOne(mongoCFG.Medalbank.modeling, query, value);
		//------------------------------------------------------------------
	} else {
		console.log("mongo................");
		records = result.data.records;
	}

	//------------------------------------------------------------------
	const recordArr = customizingSheet(records);
	//------------------------------------------------------------------

	// console.log(recordArr, maxFieldLen); 

	//-----------------------------------------
	let classStr = "";
	
	classStr = `class ${sheet}Model {\n`;
	classStr += buildFlutterClass(recordArr, sheet);
	classStr += "}\n";

	fs.writeFileSync(`data/${sheet}.dart`, classStr);
	//-----------------------------------------

	// console.log(classStr);
	
	/*
	*/


	//-----------------------------------------
	const nodeCustom = buildNodejsCode(recordArr);

	fs.writeFileSync("data/customizing.js", nodeCustom);
	//-----------------------------------------

	const project = buildMongoProject(recordArr);
	fs.appendFileSync("data/customizing.js", project);

	const group = buildMongoGroup(recordArr);
	fs.appendFileSync("data/customizing.js", group);


	
})();

//------------------------------------------------
//------------------------------------------------
//------------------------------------------------
function buildFlutterClass(records, sheet) {
	const modelname = sheet.slice(0, 1).toUpperCase() + sheet.slice(1);

	let classStr = '';
	let classInitStr = `\t${modelname}Model({\n`;
	let classFromJsonStr = `\t${modelname}Model.fromJson(Map<String, dynamic> json) {\n`;
	let classToJsontStr = `\tMap<String, dynamic> toJson() {\n`;
	classToJsontStr += `\t\tfinal Map<String, dynamic> data = {};\n\n`;

	let classInitializeStr = `\tstatic ${modelname}Model initialize() {\n`;
	classInitializeStr += `\t\t${modelname}Model data = ${modelname}Model();\n`;

	//---------------------------------
	for (const record of records) {
		record.array = record.array || false;

		const key = record.key.trim().toUpperCase();	
		if ("datetime".includes(record.type)) record.type = "string";	

		// let name = record.name;
		// let obj = name.includes("[") ? "array" : "";
		// name = name.replace(/\[|\]|{|}/g, '');

		// const init = type == "int" ? 0 : type == "bool" ? false : '""';
		let init = "";
		let type = record.type;
		//--------------
		switch (record.type.toLowerCase()) {
			case "int":
				init = 0;
				break;
			case "double":
				init = 0.0;
				break;
			case "bool":
				init = false;
				break;
			case "string":
				record.type = "String";
				init = "''";
				break;
			case "{}":
			case "object":
				record.type = "Map<String, dynamic>";
				type = "object";
				init = "{}";
				break;
			default:	// Model
				type = "model";
				init = `${record.type}.initialize()`;
				break;
		}
		//--------------

		const description = record.description ? `\t\/\/ ${record.description}` : "";

		objType = record.type;
		if (record.array) {
			objType = `List<${record.type}>`;
			init = "[]";
		}

		// class CommunityModel {
		// bool check = false;
		if (record.name) {
			classStr += `\t${objType} ${record.name} = ${init};	${description}\n`;
		} else {
			classStr += `\t\t/\/\ '${record.subname}': ${init},	${description}\n`;
		}

		if (!record.name) continue;

		// CommunityModel({
		//check = false,
		classInitStr += `\t\t${record.name}`;
		if (!record.array && "int,double,bool,string".includes(record.type.toLowerCase())) {
			classInitStr += ` = ${init}`;
		}
		classInitStr += `,\n`;

		// CommunityModel.fromJson(Map<String, dynamic> json) {
		// check = json['check'] || false;
		if (record.array) {
			if (record.type.includes('Model')) {
				classFromJsonStr += `\t\t${record.name} = json['${record.name}'] || ${init};	${description}\n`;
				classFromJsonStr += `\t\t${record.name} = [];\n`;
				classFromJsonStr += `\t\tif (json['${record.name}'] != null) {\n`;
				classFromJsonStr += `\t\t\tjson['${record.name}'].forEach(\n`;
				classFromJsonStr += `\t\t\t\t(v) {\n`;
				classFromJsonStr += `\t\t\t\t\t${record.name}.add(${record.type}.fromJson(v));\n`;
				classFromJsonStr += `\t\t\t\t},\n`;
				classFromJsonStr += `\t\t\t);\n`;
				classFromJsonStr += `\t\t}\n`;	
			} else {
				classFromJsonStr += `\t\t${record.name} = json['${record.name}'] == null ? [] : json['${record.name}'].cast<${record.type}>();\n`;
			}
		} else {
			classFromJsonStr += `\t\t${record.name} = json['${record.name}'] || ${init};	${description}\n`;
		}

		// Map<String, dynamic> toJson() {
		// data['communityID'] = communityID;
		if (record.array) {
			if (record.type.includes('Model')) {
				classToJsontStr += `\t\tif (${record.name}.isNotEmpty) {\n`;
				classToJsontStr += `\t\t\tdata['${record.name}'] = ${record.name}.map((v) => v.toJson()).toList();\n`;
				classToJsontStr += `\t\t}\n`;
			} else {
				classToJsontStr += `\t\tdata['${record.name}'] = ${record.name};\n`;
			}
		} else {
			if (record.type.includes('Model')) {				
				classToJsontStr += `\t\tif (${record.name} != null) {\n`;
				classToJsontStr += `\t\t\tdata['${record.name}'] = ${record.name}!.toJson();\n`;
				classToJsontStr += `\t\t}\n`;
			} else {
				classToJsontStr += `\t\tdata['${record.name}'] = ${record.name};\n`;
			}
		}

		// static CommunityModel initialize() {
		// data.check = false;
		classInitializeStr += `\t\tdata.${record.name} = ${init};\n`;

	}
	//---------------------------------
	classStr += "\n";

	classStr += classInitStr;
	classStr += "\t});\n\n";

	classStr += classFromJsonStr;
	classStr += "\t\t}\n\n";

	classStr += classToJsontStr;
	classStr += "\n";
	classStr += "\treturn data;\n";
	classStr += "\t}\n\n";

	classStr += classInitializeStr;
	classStr += "\n";
	classStr += "\t\treturn data;\n";
	classStr += "\t}\n";
	classStr += "\n";

	return classStr;
}
//------------------------------------------------

//------------------------------------------------
function buildMongoProject(records) {
	let recordStr = "";
	let recordStrCR = "";
	recordStrCR += "const project = {\n";
	recordStr += "const project = { ";
	for (const record of records) {
		const name = record.name;

		const adjust = ((maxFieldLen-1) % 2 * (name.length-1) % 2);
		const fldlen = parseInt((maxFieldLen - name.length) / 2) - name.length % 2;
		const tabData = '\t'.repeat(fldlen < 1 ? 1 : fldlen);
		const tabType = '\t'.repeat("int,double".includes(record.type) ? 2 : record.type == "bool" ? 0 : 1);

		recordStr += `${record.name}: 1, `;
		recordStrCR += `\t${record.name}${tabData}: 1,\n`;
	}
	recordStr += " };\n";
	recordStrCR += " };\n";
	return recordStr + "\n" + recordStrCR;
}

function buildMongoGroup(records) {
	let recordStrCR = "";
	recordStrCR += "const project = {\n";
	for (const record of records) {
		const name = record.name;

		const adjust = ((maxFieldLen-1) % 2 * (name.length-1) % 2);
		const fldlen = parseInt((maxFieldLen - name.length) / 2) - name.length % 2;
		const tabData = '\t'.repeat(fldlen < 1 ? 1 : fldlen);
		const tabType = '\t'.repeat("int,double".includes(record.type) ? 2 : record.type == "bool" ? 0 : 1);

		recordStrCR += `\t${record.name}${tabData}: { $first: "$${record.name}" },\n`;
	}
	recordStrCR += " };\n";
	return recordStrCR;
}
//------------------------------------------------

//------------------------------------------------
function buildNodejsCode(records) {
	let recordStr = "";
	recordStr += `exports.customizing = (data) => {\n`;
	recordStr += "\tconst value = {\n";
	let viewStr = "";
	for (const record of records) {
		const name = record.name;
		// let tabName, tabData, tabType, init, description;
		let tabName;
		const key = record.key.trim().toUpperCase();

		// let type = record.type.trim().toUpperCase()
		// const obj = type.includes("[") ? "array" : type.includes("{") ? "object" : "";
		// type = type.replace(/\[|\]|{|}/g, '');

		const adjust = ((maxFieldLen-1) % 2 * (name.length-1) % 2);
		const fldlen = parseInt((maxFieldLen - name.length) / 2) - name.length % 2;
		const tabData = '\t'.repeat(fldlen < 1 ? 1 : fldlen);
		const tabType = '\t'.repeat("int,double".includes(record.type) ? 2 : record.type == "bool" ? 0 : 1);

		let init = '';
		switch (record.type.toLowerCase()) {
			case "int":
				init = 0;
				break;
			case "double":
				init = 0.0;
				break;
			case "bool":
				init = false;
				break;
			case "string":
				init = "''";
				break;
			case "{}":
			case "object":
				init = "{}";
				break;
			default:	// Model
				init = "''";
				break;
		}

		const description = record.description ? `\t\/\/ ${record.description}` : "";

		//----->
		switch (record.key.toLowerCase()) {
			case "view":
				tabName = '\t'.repeat(parseInt((maxFieldLen - name.length) / 2));

				//----------------
				viewStr += `\tif (data.${name}\t${tabName}) value.${name}\t${tabName}= data.${name};\t${tabType}${description}\n`;
				//----------------
				break;
			default:
			case "pk":
			case "fk":
				tabName = '\t'.repeat(parseInt((maxFieldLen - name.length) / 2) - adjust);
				//----------------
				recordStr += `\t\t${name}${tabName}: data.${name}\t${tabData}|| ${init},\t${tabType}${description}\n`;
				//----------------
				break;
		}
		//----->
	}
	recordStr += "\t}\n";
	recordStr += viewStr + "\n";

	recordStr += "\treturn value;\n"
	recordStr += "}\n"

	return recordStr;
}


//------------------------------------------------
//------------------------------------------------
//------------------------------------------------
async function readExcel(filename, sheet) {
	const ck = fs.existsSync(filename);
    if (!fs.existsSync(filename)) {
      console.log(filename, "not exsits !!!");
    }

		const workbook = xlsx.readFile(filename);
		const sheets = Object.keys(workbook.Sheets);
    if (!sheets.includes(sheet)) {
      console.log(sheet + ": workbook.Sheets not found!!");
      return
    }
    // console.log("++++", sheet, sheets);
		let rowArr = [];

		//---------------------
    const ws = workbook.Sheets[sheet];
    if (!ws) {
      console.log("workbook.Sheets", ws);
      return
    }
    const rows = xlsx.utils.sheet_to_json(ws);
    if (rows.length == 0) {
      console.log("xlsx.utils.sheet_to_json", rows.length);
      return
    }

    console.log("customizing..");
    const records = [];
    let no = 0;
    rows.forEach(data => {
			const value = {
				name        : data["__EMPTY"  ] || "",
				subname     : data["__EMPTY_1"] || "",
				type        : data["__EMPTY_2"] || "",
				opt         : data["__EMPTY_3"] || "",
				key         : data["__EMPTY_4"] || "",
				description : data["__EMPTY_5"] || "",
				sample  		: data["__EMPTY_6"] || "",
			}
      if (value.name == "name" && value.subname == "subname") return;
			
			// value.array = false;
			console.log(value);
			if ( value.name.includes("[")) {
				value.name = value.name.replace(/\[|\]/g, '').trim();
				value.array = true;
			}
			let type = value.type.toLowerCase();
			value.array = value.type.includes("[]");
			value.type = value.type.replace("[]", "");
			switch (type) {
				case "int":
				case "double":
				case "bool":
					break;
				case "string":
				case "datetime":
				case "date":
				case "time":
					value.type = "String";
					break;
				case "{}":
				case "object":
					value.type = "object";
					break;
				default:	// Model
					type = "model";
					break;
			}

      if ((value.name || value.subname)) records.push(value);
      // if (++no > 10) return;
    })

		return records;
}
//------------------------------------------------
//------------------------------------------------
function customizingSheet(records) {
	let str = "";
	const recordArr = [];
	for (let no=0; no < records.length; no++) {
		const record			= records[no];
		if (!record.name) continue;
		record.name 			= record.name || "";
		record.subname		= record.subname || "";
		record.opt				= record.opt ? record.opt.toLowerCase() : "";
		record.key				= record.key ? record.key.toLowerCase() : "";
		record.type				= record.type || "";
		record.description= record.description || "";
		record.sample			= record.sample || "";

		if (record.name.length > maxFieldLen) maxFieldLen = record.name.length;
		str += "{ ";
		if (record.name		) str += `name: '${record.name}, '`;
		if (record.subname) str += `subname: '${record.subname}'`;
		if (record.opt		) str += `, opt: '${record.opt}'`;
		if (record.type		) str += `, type: '${record.type}'`;
		if (record.array	) str += `, array: true`;

		if (record.key) str += `, key: '${record.key}'`;
		if (record.description) str += `, description: '${record.description}'`;
		// if (record.sample) str += `,\tsample: '${record.sample}'`;
		str += " },\n";

		record.subnames = [];
		if (no <(records.length -1) && records[no+1].subname) {
			for (let no1=no+1; no1<records.length; no1++) {
				if (!records[no1].subname) { no = no1; break; }
				record.subnames.push(records[no1]);
			}			
		}

		recordArr.push(record);
	}

	return recordArr;
}
//------------------------------------------------


