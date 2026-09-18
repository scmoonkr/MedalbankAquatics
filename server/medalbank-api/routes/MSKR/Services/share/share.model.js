const mskCFG 		= require('../../Config/mskCFG');
const mongoCFG 		= require('../../Config/mongoCFG');
const mongoDB			= require('../../Class/MongoDB');
const UtilDate    = require("../../Class/DateLibrary");
const utilLibrary = require("../../Util/utilLibrary");
const utilError		= require("../../Util/utilError");
const utilJWT 		= require('../../Class/JWThashLibrary');

const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);
const utilDate	  = new UtilDate();


class ShareModel {

  static async athlete(body){
    const returnObj = { message: "", data: {}};
    let result ={}				
    try {
      const query = { athleteID: Number(body.id)};
      //----------------------------------------------------------------
      result = await mongodb.findOne(mongoCFG.Medalbank.athletes, query, { _id: 0, });
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (!result.data.athleteID) return utilError.errorMSG("Model","share", "athlete", "athleteID not found");

      const metaTitle = `${result.data.name}#${result.data.athleteID}`;
      const html = 
`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta http-equiv='refresh' content='0; URL=${global.medalbankHomeURL}/a/${result.data.athleteID}'>
            <meta charset="UTF-8">
            <meta property="og:title" content="${metaTitle}">
            <meta property="og:description" content="${metaTitle} 선수 경기실적">
            <meta property="og:image" content="${global.nodeServerURL}/cms/images/athletes/${result.data.athleteID}/k">
        </head>
        <body>
        </body>
        </html>
    `;      
    return html;
    } catch (e) {
      return utilError.errorMSG("Model","share", "athlete", "findOne.catch." + e);
    } 
    
  }
  static async time(body){
    console.log("share.times.", body);
    const returnObj = { message: "", data: {}};
    let result ={}				
    try {
      const query = { timeID: Number(body.id)};
      //----------------------------------------------------------------
      result = await mongodb.findOne(mongoCFG.Medalbank.times, query, { _id: 0, });
      //----------------------------------------------------------------		if (result.data.email) {   // object null check ECMA 5+:
			if (!result.data.timeID) return utilError.errorMSG("Model","share", "time", "timeID not found");

      const metaTitle = `${result.data.name}#${result.data.timeID}`;
      const html = 
`
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta http-equiv='refresh' content='0; URL=${global.medalbankHomeURL}/time/${result.data.timeID}'>
            <meta charset="UTF-8">
            <meta property="og:title" content="${metaTitle}">
            <meta property="og:description" content="${metaTitle} 선수 경기실적">
            <meta property="og:image" content="${global.nodeServerURL}/cms/images/times/${result.data.timeID}/k">
        </head>
        <body>
        </body>
        </html>
    `;      
    return html;
    } catch (e) {
      return utilError.errorMSG("Model","share", "time", "findOne.catch." + e);
    } 
    
  }

}
module.exports = ShareModel;