const extend 			= require('node.extend');
const archiver    = require('archiver');
const fs          = require('fs');
const swimmingCFG = require("../../Config/swimmingCFG");
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate    = require("../../Class/DateLibrary");
const MemoryDB 		= require('../../Class/MemoryDB');
const utilLibrary = require("../../Class/utilLibrary");

const mongodb 	  = new mongoDB(mongoCFG.Breaststroke.database);
const utilDate	  = new UtilDate();
const memoryDB		= new MemoryDB();


/***********************************************************
	POST(backup)
		body: { collection, zip }
***********************************************************/
const backupCollections = [
  "users",
  "athletes",
  "times",
  "pools",
  "competitions",
  "stems",
  "teams",
  "leaderboard",
  "newRecords",
  "images",
  "times_simulations",

  "reports",
  "items",
  "ootd",
  "comments",
  "posts",
  "reactiones",
  "timesImport",
  "mediaServer",
  "config",
  "history",
  "logs",
  // "rankings",
];
exports.backupDelete = async (body) => {
  console.log("backupDelete.body=", body);
  if (!body.filename) {
    returnObj.message = `backupDelete.filename not found...`;
    console.log(returnObj.message);
    return returnObj;
  }

  const filename = `${global.uploadPath}/download/${body.filename.trim()}`;
  fs.unlinkSync(filename);
  console.log("backupDelete.filename=", body.filename);

  return "ok";
}
exports.backup = async (body) => {
	console.log("backup.body=", body);
	let returnObj = { message: '', };
	//-----> query
  if (!body.collections) {
    returnObj.message = `backup.collections not found...`;
    console.log(returnObj.message);
    return returnObj;
    // body.collections = "all";
  }

	// if (body.collections == "all") body.collections = backupCollections.join(',');
  // const collectionArr = body.collections.split(',')
  //                                       .reduce((arr, coll) => {
  //                                         arr.push(coll.trim());
  //                                         return arr;
  //                                       }, [])
  const collectionArr = body.collections == "all" ? backupCollections : [ body.collections.trim() ];
console.log(collectionArr);

	//---------------------------------------------
	//---------------------------------------------
	//---------------------------------------------
	const archiveJSON = {};
	for (const collection of collectionArr) {
		if (!backupCollections.includes(collection)) {
			console.log(`medalbank>backup.collection error collection=[${collection}]`);
			continue;
		}

		const filename = `${collection}.json`;
    archiveJSON[collection] = await findCollection(collection);

    // console.log(collection, "records =", archiveJSON[collection].length, "\n");

	}                                   
	//---------------------------------------------
  //  return filename
	//---------------------------------------------
	returnObj = await this.jsonArchive(archiveJSON, body.collections);


	try {

	} catch (e) {
		returnObj = { message: `backup catch. ${e}`, data: {} };
		console.log(returnObj.message);
	}
	return returnObj;
}

//=================================
//=================================
async function findCollection(collection) {
  const limit = 10000;
  let skip = 0;

  const context = {
    query     : {},
    projection: { _id:0, },
    limit     : limit,
    skip      : 0,
    // sort      : { _id:1, },
  }

  let result;
  let contents = [];
  do {
    context.skip = skip;
    result = await mongodb.find(collection, context)
    console.log(collection, ">", skip, "/", result.count, ":", result.data.length);
    skip += limit;
    contents = contents.concat(result.data);
  } while(result.data.length >= limit)
  
  return contents;
}
//=================================

//=================================
//=================================
exports.jsonArchive = async (archives, collection) => {
	const today = new Date().toISOString().slice(0, 19).replace(/-|:/gi, '');
  const filename = `medalbank-${collection}-${today}.zip`;
  try {
  // const global = { uploadPath: "/backup/ImageMedalBank" }
	// fs.writeFileSync(filename, JSON.stringify(contents, null, '  ') );

  // create a file to stream archive data to.
  console.log("filename=", filename);
	const path = global && global.uploadPath ? global.uploadPath : "/backup";
  console.log(path);

  const output = fs.createWriteStream(`${path}/download/${filename}`);
  // console.log("output=", `${global.uploadPath}/download/${filename}`);

  // Sets the compression level.
  const archive = archiver('zip', {
		// #define Z_NO_COMPRESSION         0
		// #define Z_BEST_SPEED             1
		// #define Z_BEST_COMPRESSION       9
    zlib: { level: 9 }
  });
  console.log("1>");

	Object.keys(archives).forEach(collection => {
		archive.append(JSON.stringify(archives[collection], null, '  '), { name: `${collection}.json` });
    console.log("2>", collection);
	})

  archive.pipe(output);
  console.log("3>");

  archive.finalize();
  console.log("9>", output.path);

  } catch (e) {
    console.log("jsonArchive.catch.", e);
  }
  return filename;
}
//=================================
