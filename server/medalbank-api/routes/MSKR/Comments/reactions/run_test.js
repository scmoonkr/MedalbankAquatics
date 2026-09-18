
//============================================
const MongoDB     = require('../../../Class/MongoDB.js');
const mskCFG      = require('../../../Config/mskCFG.js');
const mongoCFG    = require('../../../Config/mongoCFG.js');
const UtilDate		= require("../../../Class/DateLibrary");
const MemoryDB		= require('../../../Class/MemoryDB');
const Service		  = require('./reactions.service.js');
const Model		    = require('./reactions.model.js');

const utilDate		= new UtilDate();
const memoryDB		= new MemoryDB();
const mongodb     = new MongoDB(mongoCFG.Medalbank.database);

//============================================
(async () => {
  let result, body, context, query;

  // result = await Model.create(body); return;

  body = { dbID: 4, dbType: "time", name:"문성태", field: "views", value: 1, userID: 1, };
  result = await Model.update(body);
  console.log(result);
	//------------------------------------------
	//------------------------------------------
	//------------------------------------------
	
})();

//=============================================
//=============================================
//=============================================
