const mongoCFG 		= require('../Config/mongoCFG');
const mongoDB			= require('../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

const { CreateCollection }   = require('./CollectionTable');

/*
 *	create
 */
 exports.create = async (collection, indexes) => {
	console.log("create collection: ", collection);
  let returnObj = { message: "", };

  try {
    let result = await mongodb.find(collection, { query:{}, projection: { _id:1 }, limit: 1 });
    if (result.data.length == 0) {
      returnObj = await mongodb.createCollection(collection);
    }
    returnObj = await mongodb.dropIndexes(collection);

    for (const index of indexes) {
      returnObj = await mongodb.createIndex(collection, index.query, index.option);
    }

  } catch (e) {
    console.log("createIndex.catch." + e);
  }

	return returnObj;
}


(async() => {
	
  await this.create(CreateCollection["activities"].collection, CreateCollection["activities"].indexes);
  return;

  for (const collection of Object.keys(CreateCollection)) {
    console.log("collection=", CreateCollection[collection].collection, "index=", CreateCollection[collection].indexes);
    // await this.create(CreateCollection["competitions"].collection, CreateCollection["competitions"].indexes);
  }

})();

