const fs = require('fs');
const mongoDB			= require('../../MSKR/Class/MongoDB');
const mongoCFG 		= require('../../MSKR/Config/mongoCFG');
const { result } = require('lodash');
const mongodb 		= new mongoDB(mongoCFG.Medalbank.database);
const Util 		= require('./util');

// const code = "D2101";
// const school = Util.SchoolTable.find(el => el.code == code.slice(2, 3));
// const styleDistance = Util.StyleDistanceTable.find(el => el.code == code.slice(3, 5));
// const disp = {
//   code: code,
//   ageGroup: school.label,
//   gender: school.gender,
//   style: styleDistance.style,
//   distance: styleDistance.distance,
// };
// console.log(code, Util.getDisplineAll(code));
// return;

(async () => {
  let result;
  
    const context = {
      query: {},
      projection: { _id:0, },
      limit: 1000000, // 1000
      skip: 0,
      sort: { competitionID:-1 },
    }
    result = await mongodb.find("sportsCompetitions", context, "Crawling");
console.log(result.data.length, result.data[0]);
    let str = "";
    for (const data of result.data) {
      str += `${data.competitionID}\t${data.competitionName}\t${data.registStart}\t${data.registEnd}\t${data.toCd}\t${data.pool}\t${data.place}\n`;
      // str += `${data.competitionID}\t${data.competitionName}\t${data.dateStart}\t${data.classCd}\t${data.toCd}\t${data.pool}\t${data.attribute}\n`;
    }
    fs.writeFileSync("55.csv", str);

    return;

  
    result = await mongodb.find(mongoCFG.Medalbank.sportsAthletes, context);
    const names = result.data.map(el => el.name);
    console.log(names.length);
    
    result = await mongodb.find(mongoCFG.Medalbank.sportsTimes, context);
    const timesNames = result.data.map(el => el.name.split(',')).join(',').split(',');
    console.log(timesNames.length, [...names, ...timesNames].length);

    
	const namesAll = [...new Set([...names, ...timesNames].map(el => el.trim()))]
    fs.writeFileSync("names.txt", namesAll.join('\n'));
    return;
    

    // const records = await mongodb.find(mongoCFG.Medalbank.sportsCompetitions, context);
    const styles = {};
    for (const event of records.data[0].events) {
      // const classCd = event.detailClassCd.slice(-2);
      // styles[classCd] = `${event.style}\t${event.distance}\n`;;
      result += `${event.ageGroup}\t${event.gender}\t${event.style}\t${event.distance}\t${event.detailClassCd}\n`;
    }
    fs.writeFileSync("test.csv", result);
})();