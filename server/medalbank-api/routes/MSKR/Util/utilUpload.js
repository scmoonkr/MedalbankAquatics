/*=== 도서정보 DAO ================
 * 2018.03.08
 * Created : 도서관 학교  
 ==================================*/	

var extend      = require('node.extend');
var moment      = require('moment');
var fs          = require('fs');
var _path       = require('path');
//var formidable  = require('formidable');

var utilMongo   = require("./utilMongo");
var utilLibrary = require("./utilLibrary");
var mongoCFG    = require('../Config/mongoCFG');


// dir: isbn --> 9788/901/234/9888901234567.jpg
function makeDirISBN(isbn) {
    isbn = ("000000000000" + isbn);
    isbn = isbn.substr(isbn.length - 13);
    let path = [ "book", isbn.substr(0, 4), isbn.substr(4, 3), isbn.substr(7, 3) ];
    return path;
}
// dir: cat  --> cata/876/543/cata876543210.jpg
function makeDirNumber(category, seqno) {
    let str = ("00000000" + seqno.toString());
    str = str.substr(str.length - 9);
    let path = [ category, str.substr(0, 3), str.substr(3, 3) ];
    return path;
}

//let global = { "uploadPath": "C:/Dev/VUE/server-node-20190726/Upload", };

function makeDIRcallback(path, callback){
	fs.exists(path, function(exists) {
		if (! exists) {
			fs.mkdir(path, function (result) {
				callback(path);
			});
		}
		else {
			callback(path);
		}
	});	
};

function makeDirectory(path, dir, callback) {
	path += dir[0];
	makeDIRcallback(path, function(result) {
	if (path) {
		if (dir.length >= 2) {
			path += "/" + dir[1];
			makeDIRcallback(path, function(result) {
			if (path) {
				if (dir.length >= 3) {
					path += "/" + dir[2];
					makeDIRcallback(path, function(result) {
					if (path) {
						if (dir.length >= 4) {
							path += "/" + dir[3];
							makeDIRcallback(path, function(result) {
								callback(path);
							});
						}
						else {
							callback(path);
						}
					}
					});
				}
				else {
					callback(path);
				}
			}
			});
		}
		else {
			callback(path);
		}
}
	});
}

/*
 *  req: { "category", seqno, file }
 *  req: { "book", "isbn", file }
 */
exports.fileUpload = async function(fields, files, callback)
{

	try {
		let save_filename = "";
		let dir = [];
		if (fields.category == "book") {
			dir = makeDirISBN(fields.isbn);
			save_filename = fields.isbn;
		}
		else {
			dir = makeDirNumber(fields.category, Number(fields.seqno));
			save_filename = fields.seqno.toString();
		}
		console.log(">>>>>>>>>>>>>>>>>>>formData.dir>>>>>"+JSON.stringify(dir));

		let path = global.uploadPath;
		makeDirectory(path, dir, function(path) {
			saveFile(path, save_filename, files, function(file_meta) {
				//console.log("--------------->saveFile.file_meta = " + JSON.stringify(file_meta));
				file_meta.category	= fields.category;
				file_meta.id		= (fields.category == "book" ? fields.isbn :  Number(fields.seqno));

				let result = updateImageMeta(file_meta);
				if (result == "OK")
					callback(file_meta);
				else
					callback("");
			
			});
		});
	} catch(e) {
		callback("");
	}  
}

async function updateImageMeta(file_meta) {
	try {
		let context = {
			url 		  	: mongoCFG.url,
			dbName			: mongoCFG.dbLibraryService,
			collectionName	: 'images',
			value			: file_meta,
			query			: { "category" : file_meta.category, "id": file_meta.id },
		};
		console.log("updateOne.context="+JSON.stringify(context));

		let result = await utilMongo.updateOne(context);
console.log("updateImageMeta="+JSON.stringify(result));
		return "OK";
	}
	catch(e) {
		console.log("images utilMongo.catch: " + e);
		return "";
	}
}

function saveFile(path, save, files, callback) {

	var fileupload = files["files"]; //files.uploads;
	let file_meta = {
		uploadname: fileupload.name,
		path: path,
		size: fileupload.size,
		//type: fileupload.type,
	}	
	let arr = file_meta.uploadname.split(".");
	file_meta.type = (arr.length > 1 ? arr[1] : "");

	//console.log(">>>>>>>>>>>>>>>>>>>>>>>path="+path + " : " + save);
	fs.exists(_path.join(path, save+".*"), function(exists) {
		if (exists) {
			console.log('File exists. Deleting now ...'+_path.join(path, fileprefix+".*"));
			fs.unlink(_path.join(path, fileprefix+".*"));
		}

		file_meta.filename = save + (file_meta.type == "" ? "" : "." + file_meta.type);
		fs.readFile(fileupload.path, function(error, data) {
			fs.writeFile(_path.join(path, file_meta.filename), data, function(error) {
				callback(error ? {} : file_meta);
			});
		});

	});
}
