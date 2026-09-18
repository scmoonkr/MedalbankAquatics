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
 const utilImage		= require("./utilImage");
  
/******************************************************************************
 *  getMeta
 *  req: { category, id }
 ******************************************************************************/
exports.getMeta = async function(body)
{
  if (!body.category || !body.db || !body.id) {
    console.log("----->media.getMeta: category, db, id not found !! ", body);
    return "";
  }
  
	try{
		const context = {
			query	: {
				category	: body.category,
				db				: body.db,
				id 				: body.id.toString()
			},
			projection		: { _id:0, },
			skip			: 0,
			limit			: 10,
		}
		let result = await mongodb.find(mongoCFG.Breaststroke.mediaServer, context);
		if(Object.keys(result.data).length == 0 ) {   // object null check ECMA 5+:
			console.log("not found");
			return "";
		}
		else {
      return result.data.note;
		}
	} catch(e) {
		console.log("images getMeta.catch: " + e);
		return "";
	}
}

/******************************************************************************
 *  uploadMeta
 *  req: { category, id, note }
 ******************************************************************************/
exports.uploadMeta = async function(body)
{
  if (!body.category || !body.id || !body.db || !body.note) {
    console.log("----->media.uploadMeta: category, db, id not found !! ", body);
    return "";
  }
  
	try{
		const query = {
			category	: body.category,
			db				: body.db,
			id 				: body.id.toString()
		}
    const value = { note: body.note };
		const result = await mongodb.updateOne(mongoCFG.Breaststroke.mediaServer, query, value);
		return "ok";
	} catch(e) {
		console.log("images uploadMeta.catch: " + e);
		return "";
	}
}

// dir: isbn --> "book/9788/901/234/9888901234567.jpg"
 function getDirISBN(isbn) {
   isbn = utilLibrary.convertISBN13(isbn);	// if isbn(10) -> isbn(13)
  //  let path = "book/" + isbn.substr(0, 4) + "/" + isbn.substr(4, 3) + "/" + isbn.substr(7, 3) + "/";
   const path = `book/${isbn.substr(0, 4)}/${isbn.substr(4, 3)}/${isbn.substr(7, 3)}/`;
 
     return path;
 }
 // dir: cat  --> cata/876/543/cata876543210.jpg
 function getDirNumber(category, seqno) {
  const str = ("00000000" + seqno.toString()).slice(-9);
  // let path = category  + "/" + str.substr(0, 3) + "/" + str.substr(3, 3)  + "/";
  const path = `${category}/${str.substr(0, 3)}/${str.substr(3, 3)}/`;
  return path;
}

function getMatchingFiles(directory, pattern) {
	// console.log("directory=", directory, "pattern=", pattern);

  // Read all files in the directory
  const files = fs.readdirSync(directory);
// console.log("files=", files);

	// Convert the pattern string (e.g., '1-*.*') to a regex
	const regexPattern = pattern.replace(/\./g, "\\.") // Escape dot (.)
															.replace(/\*/g, ".*"); // Replace * with .*

	const regex = new RegExp(`^${regexPattern}$`); // Use regexPattern here

	// Filter files that match the pattern
	const matchingFiles = files.filter(file => regex.test(file));

  return matchingFiles;
}
/******************************************************************************
 *  req: { category, db, id }
 *  res: [ '5-0.jpg', '5-1.jpg', '5-2.jpg', '5-f.jpg', '5-t.jpg' ]
 ******************************************************************************/
exports.getImages = async (body) =>{
	// console.log("getImages.body=", body);
  if (!body.db || !body.id || !body.category) {
    console.log("----->media.download: db, id, category not found !! ", body);
    return "";
  }
	try{
		const query = {
			category	: body.category,
			db				: body.db,
			id 				: body.id.toString(),
		}
		const context = {
			query: query,
			projection: { _id:0, },
			limit: 100,
			skip: 0,
		}
		// console.log("query=", query);
		const result = await mongodb.findOne(mongoCFG.Breaststroke.mediaServer, query, { _id:0,});
		// console.log(query, "mediaServer=", result.data);
		if(!result.data.category) {   // object null check ECMA 5+:
			console.log("getImages.file not not found", body);
			return "";
		}
		// console.log("result.data=", result.data);
		const path = utilImage.getDirectory(body.category, body.db, body.id);
		// console.log("path=", global.uploadPath, path);

		const id = `${result.data.id}-*.${result.data.ext}`;
		const matchingFiles = getMatchingFiles(`${global.uploadPath}${path}`, id);
// console.log("id=", id, "path=", `${global.uploadPath}${path}`, "files=", matchingFiles);

		// [ '5-0.jpg', '5-1.jpg', '5-2.jpg', '5-f.jpg', '5-t.jpg' ]
		// -----> [ '0', '1', '2', 'f', 't' ]
		return matchingFiles.map(el=> el.replace(new RegExp(`\\.${result.data.ext}`, "g"), "")
																		.replace(new RegExp(`${result.data.id}-`, "g"), ""));
	} catch(e) {
		console.log("getImages.catch: " + e);
		return [];
	}
}
 
/******************************************************************************
 *  req: { category, db, id, type }
 *  req: { book, isbn }
 ******************************************************************************/
exports.download = async function(body)
{
	// console.log("download.body=", body);
	body.note = "note..."
  // console.log("media.download.body=", body)
  if (!body.category || !body.db || !body.id) {
    console.log("----->media.download: category, db, id, note not found !! ", body);
    return "";
  }
  
	try{
		const query = {
			category	: body.category,
			db				: body.db,
			id 				: body.id.toString()
		}
		if (body.type && body.type != 't') query.type = body.type;
		// console.log("query=", query);
		const result = await mongodb.findOne(mongoCFG.Breaststroke.mediaServer, query);
		// console.log(query, "mediaServer=", result.data);
		if(!result.data.category) {   // object null check ECMA 5+:
			console.log(`download.file not not found: [/${body.category}/${body.db}/${body.id}/${body.type}]`);
			return "";
		}
		// console.log("result.data=", result.data);
		const path = utilImage.getDirectory(body.category, body.db, body.id);
		// console.log("path=", global.uploadPath, path);
		// const filename = _path.join(global.uploadPath+path, `${result.data.id}.${result.data.ext}`);
		//----------------------------------------
		// 'f': featured image --> '1.jpg'
		// 't': thumbnail image --> '1-t.jpg'
		// '0~9': images --> '1-0.jpg'
		// const id = body.type == "f" ? `${result.data.id}` : `${result.data.id}-${body.type}`;
		const id = `${result.data.id}-${body.type}`;
		const filename = `${global.uploadPath}${path}/${id}.${result.data.ext}`;
		// console.log(`filename=[${filename}]`);
		const file = fs.readFileSync(filename, "binary");
		result.data.file = file;
		return result.data;
	} catch(e) {
		// console.log("download.images download.catch: " + e);
		return "";
	}
}

exports.downloadByFilename = async function(body) {
//   console.log("cms.downloadByFilename.body=", body);
  // console.log("media.download.body=", body)
  if (!body.filename) {
    console.log("----->media.downloadByFilename: filename, note not found !! ", body);
    return "";
  }
  
	try{
    const ext = body.filename.split('.');
    const result = { data: { name: body.filename, ext: ext[ext.length-1] } };
		const filename = `${global.uploadPath}/download/${body.filename}`;
		console.log(`filename=[${filename}]`);

    result.data.file = fs.readFileSync(filename, "binary");

		return result.data;
	} catch(e) {
		console.log("download.images downloadByFilename.catch: " + e);
		return "";
	}
}
