const moment    	= require('moment');

const utilLibrary = require("../Util/utilLibrary");
const excelLibrary= require('../Util/excelLibrary');

const excel	      = new excelLibrary();

(async () => {

  let result, url, param;
  // result = await indexDAO.create();

  const filename = "E:/OneDrive/Document/00. MSK/Design/modeling 20220820.xlsx";
  result = await excel.read_excel(filename,"요약");

	//--------------------------
	const struct = makeObject(result);
	//--------------------------
	console.log(struct);
})();

//=========================================================
function makeObject(excel) {
	let struct = "";
	struct += "exports.transactionCode = {\n";

	//-----------------------------------
	// users: {	
	// 	create: {	code: 1000,	authority: 9,	func: 'create',	},
	let cat = "";
	try {
		for (let no=0; no<excel.length; ) {
			const row = excel[no];
			cat = excel[no].cat2 || "";
			if (cat.length > 0 && cat != "xxxxx") {
				struct += `\t${cat}: {\n`;
				let oldCat = "";
				do {
					if ((excel[no].function||"").length > 0) {
						struct += `\t\t${excel[no].function}: {	code: ${excel[no].code},	authority: ${excel[no].authority},	func: '${excel[no].function}',	},\n`;
					}

					cat = excel[++no].cat2 || "";
				} while (cat.length == 0);
				struct += "\t},\n";
			} else no++;

		}
	} catch (e) {
		if (cat != "xxxxx") struct += "\t},\n";
	}
	//-----------------------------------
	struct += "}\n";

	return struct;
}