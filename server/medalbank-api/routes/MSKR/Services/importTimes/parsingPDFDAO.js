/*=== 도서정보 DAO ================
 * 2018.03.08
 * Created : 도서관 학교  
 ==================================*/	

 const extend				= require('node.extend');
 const moment				= require('moment');
 const fs						= require('fs');
 const _path				= require('path');
 const formidable		= require('formidable');

 const utilLibrary	= require("../../Util/utilLibrary");
 const mongoCFG			= require('../../Config/mongoCFG');
 const mongoDB			= require('../../Class/MongoDB');
 const mongodb			= new mongoDB(mongoCFG.Medalbank.database);
 const pdfDAO				= require('./pdfDAO');

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
			console.log("File not found 5");
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
 *  parsingPDF: { category, id, file }
 *
 ******************************************************************************/
exports.parsingPDF = async (body, src) => {
	console.log("++++++++++++++++++++++++++++++++++++++");
	console.log("parsingPDF.body: ", body);
	// console.log("parsingPDF.src.files: ", src.files);
	// console.log("parsingPDF.src.originalFilename: ", src.files.originalFilename);
	console.log("++++++++++++++++++++++++++++++++++++++");
	let file_meta = {};
	if (src.files != undefined && src.files.filepath != undefined && src.files.path == undefined) src.files.path = src.files.filepath;

	await readFileSync(src)
		.then(function(meta) {
			file_meta = meta;
		})
		.catch(function (err) {
			console.log("3>read url request.error="+err);
			file_meta = null;
		});

	if (file_meta == null) return(null);
	const fullpath = `${__dirname}/${file_meta.name}`;
console.log(file_meta.name, fullpath);
	fs.writeFileSync(fullpath, file_meta.buffer);
// console.log("file_name ++++", file_meta.name);

// parsing pdf
const result = await pdfDAO.readPDF(fullpath);
console.log(result);
// fs.unlink(`${__dirname}/${file_meta.name}`);


	return { data: result };
}
