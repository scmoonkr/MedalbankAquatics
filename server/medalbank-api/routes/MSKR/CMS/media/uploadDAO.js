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
 const utilImage		= require("./utilImage");
 
 
console.log('----------------------------------------------');
console.log('global.uploadPath: ', global.uploadPath);
console.log('----------------------------------------------');

//--------------------------------------------------------
 //	read file
 //	FILE or URL
//--------------------------------------------------------
const readFileSync = (src)=> new Promise((resolve)=> {
	try {
		let file = src;
		if (src.files !== undefined) {
			
			if (Array.isArray(src.files)) {
				console.log("array...");
			file = src.files[0];
		} else {
				console.log("not array...");
				file = src.files
			}
		}
// console.log("----------------------------------------");		
// console.log("fil.path=", file.path);
// console.log("fil.originalFilename=", file.originalFilename);	
// console.log("fil.type=", file.type);
// console.log("fil.mimetype=", file.mimetype);
// console.log("----------------------------------------");		
		if (file && file.filepath && !file.path) file.path = file.filepath;
		if (file && file.originalFilename && !file.name) file.name = file.originalFilename;

		if (!file.type) file.type = file.mimetype;

		if(!fs.existsSync(file.path)) {
			console.log("File not found 777", file);
			resolve(null);
		}
		console.log("filename=", file.name);

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

function isObject(variable) {
  return typeof variable === 'object' && variable !== null && !Array.isArray(variable);
}

function isArray(variable) {
  return Array.isArray(variable);
}

function isArrayOfObjects(variable) {
  return Array.isArray(variable) && variable.every(item => typeof item === 'object' && item !== null);
}

/******************************************************************************
 *
 *  upload: { category, id, file }
 *
 ******************************************************************************/
exports.upload = async (body, src) => {
	console.log("++++++++++++++++++++++++++++++++++++++");
	console.log("upload.body: ", body);
	// console.log("upload.src.files: ", src.files);
	let file_meta = {};
	if (typeof src === 'string') {
		await utilImage.readRequestURL(src)
			.then(function(buffer) {
				let arr = src.split("/");
				let idarr = arr[arr.length-1].split(".");
				file_meta = {
					ext:		(idarr.length > 1 ? idarr[1] : "jpg"),
					type:		"image/" + file_meta.ext,
					buffer:	buffer
				};
			})
			.catch(function (err) {
				console.log("3>read url request.error="+err);
				file_meta = null;
			});
	}
	else {
		// console.log("\n\nsrc====>", src.files);

		console.log("Array.isObject(src.files)=", isObject(src.files));
		console.log("Array.isArray(src.files)=", isArray(src.files));
		console.log("Array.isArrayOfObjects(src.files)=", isArrayOfObjects(src.files));
		// if (Array.isArray(src.files)) {
		// 	src.files = src.files[0];
		// }
		console.log("++++++++++++++++++++++++++++++++++++++ src:", src.files);

		// if (src.files && src.files.filepath && !src.files.path) src.files.path = src.files.filepath;
		// if (src.files && src.files.originalFilename && !src.files.name) src.files.name = src.files.originalFilename;
		// console.log("1> src.files.path====> ", src.files.path);
		// console.log("upload.src.files.originalFilename: ", src.files.originalFilename);
		// console.log("upload.src.files.name: ", src.files.name);
		await readFileSync(src)
			.then(function(meta) {
				console.log("meta: ", meta);
				file_meta = meta;
			})
			.catch(function (err) {
				console.log("3>read url request.error="+err);
				file_meta = null;
			});
	}
console.log("1-----> file_meta=", file_meta);

	if (!file_meta) return(null);

	if ("xlsx,xls,jpg,png,gif,bmp,mp3".indexOf(file_meta.ext.toLowerCase()) >= 0) {
		try {
			const parser						= exif_parser.create(file_meta.buffer);
			const parser_result			= parser.parse();
			file_meta.exifTags			= parser_result.tags;
			file_meta.exifImageSize	= parser_result.imageSize;
			file_meta.size					= file_meta.buffer.length;
		} catch(e) {
			console.log("exif_parser.error."+e);
		}
	}
	file_meta.size					= file_meta.buffer.length;

	let buffer = file_meta.buffer;
	delete file_meta.buffer;

	//-----> id가 없으면, 일련번호 가져오기
	body.id = (body.id === undefined ? "" : body.id.toString());
	if (!body.id) {
		body.id = await mongodb.max(mongoCFG.Medalbank.mediaServer, "id", { category: body.category });
	}

	//-----> id로 directory만들기: {category} / id(9999) / id(888) / id(777)
	file_meta.path = await utilImage.makeDirectorySync(body.category, body.type, body.id);
//console.log("saveImageURL." + body.category + " : " + body.id + " : " + file_meta.path);

console.log("body, file_meta", body, file_meta);
console.log("uploadPath, path", global.uploadPath, file_meta.path,);
	//-----> write file
	let fullpath = global.uploadPath + file_meta.path;
	let filename = fullpath + "/" + body.type + "/" + body.id + file_meta.ext || "";
	if (!file_meta.name) file_meta.name		= body.id + "." + file_meta.ext;
	console.log("1>#### fullpath, name, filename=", fullpath, file_meta.name, filename);

	file_meta.category	= Array.isArray(body.category) ? body.category[0] : body.category;
	file_meta.type	= body.type;
	file_meta.id		= body.id.toString();
	file_meta.url		= "/cms/" + body.category + "/" + body.type + "/" + body.id;
	file_meta.mtime		= new Date().toISOString();
	file_meta.type	= Array.isArray(file_meta.type) ? file_meta.type[0] : file_meta.type;
	if (file_meta.type) file_meta.group = file_meta.type;
	console.log("+++++++++++++++++++++++++++++++++++++++++++++++++ file_meta ++++", file_meta);
		
		// fs.writeFileSync((filename + "." + file_meta.ext), buffer);
	// fs.writeFileSync(`${fullpath}/${file_meta.name}`, buffer);
	fs.writeFileSync(`${fullpath}/${file_meta.id}.${file_meta.ext}`, buffer);
// console.log("file_name ++++", file_meta.name);

	//-----> update image meta
	await updateImageMeta(file_meta);

	return file_meta;
}


//--------------------------------------------------------
//	update image metadata
//--------------------------------------------------------
async function updateImageMeta(file_meta) {
	try {
	//
	//
	//
	const query = { "category" : file_meta.category, "type" : file_meta.type, "id": file_meta.id };
	console.log("query=", query);
	const result = await mongodb.updateOne(mongoCFG.Medalbank.mediaServer, query, file_meta);
	return result.data; 
	} catch(err) {
	const result = "updateImageMeta.catch.error=" + err;
	return result; 
	}
}
 