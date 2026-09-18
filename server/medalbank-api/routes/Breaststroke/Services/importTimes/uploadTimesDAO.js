/*=== 도서정보 DAO ================
 * 2018.03.08
 * Created : 도서관 학교  
 ==================================*/	

 const extend				= require('node.extend');
 const moment				= require('moment');
 const fs						= require('fs');
 const _path				= require('path');
 const formidable		= require('formidable');

 const utilLibrary	= require("../../Class/utilLibrary");
 const mongoCFG			= require('../../Config/mongoCFG');
 const mongoDB			= require('../../Class/MongoDB');
 const mongodb			= new mongoDB(mongoCFG.Breaststroke.database);
 const utilImage		= require("../media/utilImage");
 const timesDAO			= require("../times/times.model");
 
 const excelLibrary= require('../../Class/excelLibrary');
 const excel	      = new excelLibrary();

 const excelDAO		= require("./importUTIL/excelDAO");
 const { customTime }	= require("./utilImport");

//--------------------------------------------------------
 //	read file
 //	FILE or URL
//--------------------------------------------------------
const readFileSync = (src)=> new Promise((resolve)=> {
	try {
		let file = src;
		if (src.files !== undefined) {
			// file = src.files[0];
			file = src.files
		}
		if(!fs.existsSync(file.path)) {
			console.log("File not found 5555", src);
			resolve(null);
		}

		if (!file.type) file.type = file.mimetype;
		if (!file.name) file.name = file.originalFilename;

		let pos = file.name.lastIndexOf(".");
		const mimetype = ((file.type == undefined ? file.mimetype : file.type)+"/").split("/");

		let ext = (pos < 0 ? (mimetype[1] == "" ? "jpg" : mimetype[1]) : file.name.substr(pos+1));
		if ("txt,jpg,png,gif,bmp,pdf,xlsx,xls,ppt,pptx,doc,docx,hwp,hwpx".indexOf(ext) < 0) ext = "jpg";
		const file_meta = {
			ext:		ext,
			type:		file.mimetype,
			name:		file.name,
			buffer:	fs.readFileSync(file.path)
		};
		// console.log("file.path=", file.path, "file.type=", file.type, "file_meta=", file_meta);
		resolve(file_meta);
	} catch (err) {
		console.log("4>error="+err);
		resolve(null);
	}
});

/******************************************************************************
 *
 *  upload: { category, id, file }
 *
 ******************************************************************************/
exports.uploadTimes = async (body, src) => {
	// console.log("++++++++++++++++++++++++++++++++++++++");
	console.log("upload.body: ", body);
	// console.log("upload.src.files: ", src.files);
	// console.log("upload.src.originalFilename: ", src.files.originalFilename);
	// console.log("++++++++++++++++++++++++++++++++++++++");
	let file_meta = {};
	//console.log("src====>", src.files.filepath);
	if (src.files != undefined && src.files.filepath != undefined && src.files.path == undefined) src.files.path = src.files.filepath;
	await readFileSync(src)
		.then((meta) => {
			file_meta = meta;
		})
		.catch((err) => {
			console.log("3>read url request.error="+err);
			file_meta = null;
		});

	if (file_meta == null) return(null);

	let buffer = file_meta.buffer;

	const competitionID = Number(body.id);

//-----> write uploaded file to local data dir
	const dataDir = `${__dirname}/data`;
	const filename = `${dataDir}/${file_meta.name}`;
	console.log("########################", competitionID, file_meta.name, filename);
	fs.writeFileSync(`${filename}`, buffer);
	console.log(filename, "file_name ++++", file_meta.name);

	//--------------------------------------------
	//	get competition
	//--------------------------------------------
	const res = await mongodb.findOne(mongoCFG.Breaststroke.competitions, { competitionID: competitionID }, { _id:0, extraInfo:0, styleDistances:0, });
	const competition = res.data || {};
	if (!competition.competitionID) competition.competitionID = competitionID;
	console.log("+++++++++++++++++++++++++", competitionID, competition);

	//--------------------------------------------
	//	read & customize times from uploaded excel
	//--------------------------------------------
	const times = await excelDAO.readTimesFromExcelORG(competition, dataDir, file_meta.name);
	if (times.length == 0) {
		console.log("no data");
		return { data: [], message: "no data" };
	}

	const timeArr = [];
	for (let seqno = 0; seqno < times.length; seqno++) {
		const time = times[seqno];
		time.seqno  = seqno;
		time.pool   = time.pool   || competition.pool   || "";
		time.poolID = time.poolID || competition.poolID || 0;
		time.sido   = time.sido   || competition.sido   || "";
		time.course = time.course || competition.course || "";
		timeArr.push(customTime(time)); // utilImport.js
	}

	//--------------------------------------------
	//	timesImport: delete existing then insert
	//--------------------------------------------
	await mongodb.deleteMany(mongoCFG.Breaststroke.timesImport, { competitionID: competition.competitionID });
	await mongodb.insertMany(mongoCFG.Breaststroke.timesImport, timeArr);
	console.log("\n===============================\ncid=" + competition.competitionID + "\nupload.times=", timeArr.length, "\n===============================\n");

	//--------------------------------------------
	//	return first page (100 rows) + total count
	//--------------------------------------------
	const pageSize = Number(body.page_size) || 100;
	const page		 = Number(body.page) || 1;
	return {
		data			: timeArr.slice((page - 1) * pageSize, page * pageSize),
		count			: timeArr.length,
		page			: page,
		page_size	: pageSize,
		message		: excelDAO.checkDuplicate(timeArr),
	};
}
