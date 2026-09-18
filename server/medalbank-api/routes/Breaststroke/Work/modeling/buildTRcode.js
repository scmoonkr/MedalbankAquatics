const fs          = require('fs');
const xlsx        = require('xlsx');
const utilLibrary = require('../../../util/utilLibrary');

const excelLibrary= require('../../../util/excelLibrary');
const excel	      = new excelLibrary();

const UtilDate    = require("../../../util/utilDate");
const utilDate	  = new UtilDate();

const mongoDB			= require('../../../class/MongoDB');
const mongoCFG 		= require('../../../config/mongoCFG');
const mskCFG 			= require('../../../config/mskCFG');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);

/*
function makeAPIs(item) {
	let str = ``;

}

let str;
const items = [
	{ item: "users", function: "create" },
	{ item: "users", function: "list" },
	{ item: "replies", function: "detail" },
	{ item: "replies", function: "insert" },
	{ item: "replies", function: "update" },
	{ item: "users", function: "delete" },
	{ item: "users", function: "summary" },
];
str = makeAPIs(item)s;
return;
*/



// const len = 3;
// const str = '#'.repeat(len);
// console.log(str);
// return;

const global = {}; 
//----- home
let oneDrive 			= "E:\OneDrive"; 
global.mskrPath   = "f:/backup/MSKR";
global.KSF        = "f:/backup/KSF";

// oneDrive = "aaa"
if (! fs.existsSync(oneDrive + "/2. 2023")) {
	oneDrive 					= "C:/Users/Administrator/OneDrive"; 
	global.mskrPath   = "c:/backup/MSKR";
	global.KSF        = "c:/backup/KSF";
}
const sourcePath 					= oneDrive + "/5. 메달뱅크/Design";

const sheet = process.argv.length < 3 ? "ServerNew" : process.argv[2];
const filename = process.argv.length < 4 ? `${oneDrive}/5. 메달뱅크/Design/MedalBank modeling 20230202.xlsx` : process.argv[3];

console.log(`filename=${filename}, sheet=${sheet}`);
return;
// name: "", len: n,
const fieldLength = {};

(async () => {

	let records, result;
	
	
	//--------------------------------------------
	records = await readExcel(filename, sheet);
	//--------------------------------------------
console.log(records.length);

	const trcodeStr = buildTrCode(records);	

	fs.writeFileSync("data/transactionCategory.js", trcodeStr);
	//-----------------------------------------

	
})();


/*
 *
	{
    trcode: 1000,
    item: 'common',
    item1: 'login',
    method: 'get',
    url: '/',
    function: 'detail',
    APIs: '',
    param: '',
    description: ''
  },

	exports.TransactionCategory = {
	//----------------------------------------
	//	logs
	//----------------------------------------
	logs: {
		create: { trcode: 100,     authority: 9,   func: 'create', },
		list	: { trcode: 101,     authority: 0,   func: 'list',   },
		detail: { trcode: 102,     authority: 1,   func: 'detail', },
		insert: { trcode: 103,     authority: 1,   func: 'insert', },
		update: { trcode: 104,     authority: 1,   func: 'update', },
		delete: { trcode: 105,     authority: 8,   func: 'delete', },
	},
 *
 */
function buildTrCode(records) {
	let trcodeStr = "";
	trcodeStr += `exports.TransactionCategory = {\n`;
	trcodeStr += ``;

	let oldItem = records[0].item;
	let oldItem1 = records[0].item1;

	trcodeStr += `\t\/\/---------------------------------------,\n`;
	trcodeStr += `\t\/\/\t${oldItem1}\n`;
	trcodeStr += `\t\/\/---------------------------------------,\n`;
	trcodeStr += `\t${oldItem1}: {\n`;

	const TrCode = {};
	for (const row of records) {
		if (!row.item) row.item = oldItem;
		if (!row.item1) row.item1 = oldItem1;

		if (oldItem1 != row.item1) {
			trcodeStr += `\t},\n`;
			trcodeStr += `\n`;
			trcodeStr += `\t\/\/---------------------------------------,\n`;
			trcodeStr += `\t\/\/\t${row.item1}\n`;
			trcodeStr += `\t\/\/---------------------------------------,\n`;
			trcodeStr += `\t${row.item1}: {\n`;
	// }

	// //----------------------------------------
	// //	logs
	// //----------------------------------------
	// logs: {
		}
		if (!TrCode.item1) TrCode.item1 = {};

		const description = row.description ? "\t\/\/ " + row.description : "";
		const tab = row.function.length > 10 ? "" : "\t".repeat((10-row.function.length)/2);
		const item = `\t\t${row.function}:\t${tab}{ trcode: ${row.trcode},\tauthority: '${row.authority}',\tfunc: '${row.function}'${tab} },${description}\n`;
		trcodeStr += item;
	
		oldItem = row.item;
		oldItem1 = row.item1;
	} // end for

	trcodeStr += `\t},\n`;

	trcodeStr += `}\n`;
	return trcodeStr;
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
			if (data.function) {
				const value = {
					trcode			: data.trcode 			|| "",
					item				: data.item 				|| "",
					item1				: data.item1 				|| "",
					method			: data.method 			|| "",
					url					: data.url 					|| "",
					function		: data.function			|| "",
					authority		: data.authority		|| "",
					APIs				: data.APIs 				|| "",
					param				: data.param 				|| "",
					description	: data.description	|| "",
				}
				records.push(value);
			}
      // if (++no > 10) return;
    })

		return records;
}
//------------------------------------------------
//------------------------------------------------

