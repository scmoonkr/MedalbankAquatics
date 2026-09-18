
const mongoCFG			= require('../Config/mongoCFG');
const mongoDB			= require('../Class/MongoDB');
const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const utilLibrary = require("../Util/utilLibrary");


(async () => {
  let result, body;
  
  const context = {
    query: { norm: { $exists: false } },
    projection: { _id:0, timeID:1, name: 1, norm:1, team:1 },
    limit: 100000,
    skip: 0,
  }
  result = await mongodb.find(mongoCFG.Medalbank.times, context );
console.log(result.data.length, result.data[0]);
for (const time of result.data) {
  const query = { timeID: time.timeID }
  const value = { norm: utilLibrary.normalizeMSKR(time.name) }
  console.log(time, query, value);
  // await mongodb.updateOne(mongoCFG.Medalbank.times, query, value );
}
  // time.norm = utilLibrary.normalizeMSKR(time.name);

})();