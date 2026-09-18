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

let context = {
	url 		  	: mongoCFG.url,
	dbName			: mongoCFG.dbLibraryService,
	collectionName	: 'images',
	projection		: { _id:0, },
	skip			: 0,
	limit			: 10,
};

// dir: isbn --> 9788/901/234/9888901234567.jpg
function getDirISBN(isbn) {
	isbn = utilLibrary.convertISBN13(isbn);	// if isbn(10) -> isbn(13)
    let path = "book/" + isbn.substr(0, 4) + "/" + isbn.substr(4, 3) + "/" + isbn.substr(7, 3) + "/";

    return path;
}
// dir: cat  --> cata/876/543/cata876543210.jpg
function getDirNumber(category, seqno) {
    let str = ("00000000" + seqno.toString());
    str = str.substr(str.length - 9);
    let path = category  + "/" + str.substr(0, 3) + "/" + str.substr(3, 3)  + "/";
    return path;
}

/*
 *  req: { "category", seqno, file }
 *  req: { "book", "isbn", file }
 */
exports.download = async function(category, id, callback)
{

	let path = global.uploadPath;
	switch (category) {
		case "isbn":
			path += getDirISBN(id);
			console.log("isbn="+id);
			break;
		case "player":
		case "user":
				id = Number(id);
				path += getDirNumber(category, id);
			console.log(category+"="+id);
			break;
	}

	try {
		context.query = { "category" : category, "id": id };

		let result = await utilMongo.findOne(context);
		if (Object.keys(result).length == 0 ) {   // object null check ECMA 5+:
			callback("");
		}
		else {
			console.log("findOne="+JSON.stringify(result));

			fs.readFile(_path.join(result.path, result.filename), "binary", function (err, file) {
				console.log("readfile ok");
				result.file = file;
				callback(result);
			});

		}
	}
	catch(e) {
		console.log("images insertOne.catch: " + e);
		callback("");
	}

}

function saveFile(path, save, files, callback) {

	var fileupload = files["files"]; //files.uploads;
	let file_meta = {
		name: fileupload.name,
		path: path,
		size: fileupload.size,
		//type: fileupload.type,
	}	
	let arr = file_meta.name.split(".");
	file_meta.type = (arr.length > 1 ? arr[1] : "");

	//console.log(">>>>>>>>>>>>>>>>>>>>>>>path="+path + " : " + save);
	fs.exists(_path.join(path, save+".*"), function(exists) {
		if (exists) {
			console.log('File exists. Deleting now ...'+_path.join(path, fileprefix+".*"));
			fs.unlink(_path.join(path, fileprefix+".*"));
		}

		file_meta.save = save + (file_meta.type == "" ? "" : "." + file_meta.type);
		fs.readFile(fileupload.path, function(error, data) {
			fs.writeFile(_path.join(path, file_meta.save), data, function(error) {
				callback(error ? {} : file_meta);
			});
		});

	});
}
