const _    				= require('lodash');
const extend 			= require('node.extend');
const mskCFG    = require('../../Config/mskCFG.js');
const mongoCFG 		= require('../../Config/mongoCFG.js');
const mongoDB			= require('../../Class/MongoDB.js');
const UtilDate		= require("../../Class/DateLibrary.js");
const utilLibrary = require("../../Class/utilLibrary.js");
const utilError		= require("../../Class/utilError.js");
// const utilDatabase= require('../utilDatabase');
const imageLibrary= require("../library/images.library.js");
const TimeLibrary = require('../../Class/TimeLibrary.js');
const utilImgBB = require('../../Class/utilImgBB.js');
const excelLibrary= require('../../Class/ExcelLibrary.js');
const excel         = new excelLibrary();

const Customizing = require("./magazine.custom.js");

const mongodb 		= new mongoDB(mongoCFG.Breaststroke.database);
const utilDate		= new UtilDate();

const PK = "magazineID";
const MAX_LIMIT = 100;

const timeLibrary = new TimeLibrary();

async function listRealtime(query, limit=8, skip=0) {
  // query.athleteID	= { $gt: 0 };
  query.timenum = { $gt: 0, };
  if (!query.competitionID) query.competitionID = { $ne: 99999 }
  delete query.group;

  const aggregate = [
    { $match: query }, // 선수별 최고 기록 추출			
    { $facet: {
        
      // 전체 row 개수 계산
      totalRowCount: [ { $count: "count" } ],					
      
      data: [
          // 1. timenum로 정렬
          { $sort: { timenum: 1 } },
          // 2. 이름별로 첫 번째 레코드(가장 좋은 기록) 선택
          { $group: {
              _id: "$name",
              bestRecord: { $first: "$$ROOT" }
            }
          },
          // 3. 결과 구조 정리
          { $project: {
              _id: 0,
              timeID					: "$bestRecord.timeID",
              athleteID				: "$bestRecord.athleteID",
              name						: "$bestRecord.name",
              time						: "$bestRecord.time",
              timenum				  : "$bestRecord.timenum",
              rank						: "$bestRecord.rank",
              datetime				: "$bestRecord.datetime",
              // thumbnail				: "$bestRecord.thumbnail",
              sido						: "$bestRecord.sido",
              ageGroup				: "$bestRecord.ageGroup",
              competitionID		: "$bestRecord.competitionID",
              competitionName	: "$bestRecord.competitionName",
              poolID					: "$bestRecord.poolID",
              pool						: "$bestRecord.pool",
              teamID					: "$bestRecord.teamID",
              team						: "$bestRecord.team",

              
              distance				: "$bestRecord.distance",
              course					: "$bestRecord.course",
              gender					: "$bestRecord.gender",
              style						: "$bestRecord.style",
              discipline			: "$bestRecord.discipline",
            }
          },
          // 4. 기록 순으로 정렬
          { $sort	: { timenum: 1 } },
          { $skip	: skip },
          { $limit: limit }
        ]
      }
    },
  
    // 7. totalRowCount 값을 result와 병합
    { $project: {
        count	: { $arrayElemAt: ["$totalRowCount.count", 0] },
        data	: 1
      }
    }
  ];

  const result = await mongodb.aggregate("mergedTimes", aggregate);

  // rank 부여
  const assignTimes = timeLibrary.assignRanksBreaststroke(result.data[0].data);

  const returnObj = {
    count	: result.data[0].count,
    data	: {
      times				: assignTimes,
      // compression	: compression,
    },
  };
  // console.log("----------++++++------", returnObj.data.times.length);

  return returnObj;

}

async function buildTimes(subQuery) {  
  let str = "";
  let recordArr = [];
  for (const discipline of ["FR", "BK", "BR", "FL", "IM"]) {
    for (const gender of ["men", "women"]) {
      for (const distance of ["50M", "100M", "200M", "400M", "800M", "1500M"]) {
        for (const course of ["LCM", "SCM"]) {
          if (discipline == "IM") {
            if (course == "LCM" && !["200M","400M"].includes(distance)) continue;
            if (course == "SCM" && !["100M","200M","400M"].includes(distance)) continue;
          }
          //---------------------------------------------
          const query = { ...subQuery, discipline, gender, distance, course, };
          result = await listRealtime(query, limit=20, skip=0);
          if (result.data.times.length == 0) continue;
          //---------------------------------------------
          // console.log(result.data);
          const header = `${mskCFG.getGendersEngKor(gender)} ${mskCFG.getDisciplineKor(discipline)} ${distance} ${course}\n`;
          recordArr.push({rank:header, name:'', sido:'', datetime:'', time:'', pool:'', competitionName:''});

          for (const time of result.data.times) {
            const datetime = time.datetime ? new Date(time.datetime).toISOString().slice(0, 10) : "";
            str += `${time.rank}\t${time.name}\t${time.sido+"\n"+time.pool}\t${datetime}\t${time.time}\n`;
            const place = time.sido == '해외' ? time.pool ?? time.sido : time.sido;
            recordArr.push({rank:time.rank, name: time.name, sido: place, datetime: datetime, time: time.time, pool: time.pool ?? '', competitionName: time.competitionName ?? ''});
          }
          recordArr.push({rank:'', name:'', sido:'', datetime:'', time:'', pool:'', competitionName: ''});
          // console.log(subQuery, header);
        }
      }
    }
  }
console.log(subQuery, recordArr.length);

  return recordArr;
}

async function saveExcel(times, filename) {  

  const excelHeader = [
    // { label: "#", column: "no", type: "n", width: 30, },
    { label: "순위", column: "rank", type: "n", width: 50, },
    { label: "성명", column: "name", type: "s", width: 50, },
    { label: "시도", column: "sido", type: "s", width: 80, },
    { label: "일자", column: "datetime", type: "s", width: 70, },
    { label: "기록", column: "time", type: "s", width: 50, },
    { label: "pool", column: "pool", type: "s", width: 200, },
    { label: "대회", column: "competitionName", type: "s", width: 200, },
  ];
  await excel.write_excel_sheets(filename, times, excelHeader);
}


class MagazineModel {
	static async create() {
		const indexes = [
			{ query: { magazineID:1 }, name: "magazineID", option: { unique: true }	},
			{ query: { "magazines.category":1 }, name: "category"	},
		];
		await mongodb.createCollectionNindex(mongoCFG.Breaststroke.magazine, indexes);
	}

	// view
	static async detail(body) {
		console.log("model.magazines.detail.body=", body);
		//----------------------------------------------------------------
		const query = { magazineID: Number(body.magazineID) };
		const returnObj = await mongodb.findOne(mongoCFG.Breaststroke.magazine, query, { _id:0 });
		if (returnObj.data.length == 0) return { message: "no data", data: {} }

		returnObj.data = Customizing.field(returnObj.data);
		console.log("magazines.detail.returnObj=", returnObj.data);
		//----------------------------------------------------------------

		return returnObj;
	}

  //####################################################################
  //######### Confirm ##################################################
  //####################################################################
	// find magazines
	static async list(query, body) {
		const limit = body.limit ? Number(body.limit) : MAX_LIMIT;
		let skip = (Number(body.page??1)-1)	* limit;
		skip = skip < 0 ? 0 : skip;
		// query.competitionCount = { $gt: 0}
		const context = {
			query			: query,
			projection: { _id:0, },
			limit			: limit,
			skip			: skip,
			sort			: { gender:1, discipline:1, distance:1, time: 1, datetime: -1 },
		}
		//----------------------------------------------------------------
		const result = await mongodb.find(mongoCFG.Breaststroke.magazine, context)
		console.log(query, "magazine.list.", result.data.slice(0,2));
		//----------------------------------------------------------------
		result.data = result.data.map(data => Customizing.field(data));
		console.log(query, "magazine.list.", result.data.slice(0,2));
		
		const datetime = await mongodb.distinct(mongoCFG.Breaststroke.magazine, "datetime")
		console.log("datetime=", datetime, datetime.data.map(el => el.slice(0, 7)));
		result.months = [ ...new Set(datetime.data.map(el => el.slice(0, 7)))].sort((a,b) => b-a);
		console.log("months=", result.months);
		return result;
	}
	// insert
	static async insert(body) {
		const value = Customizing.field(body);
		value.magazineID = await mongodb.max(mongoCFG.Breaststroke.magazine, "magazineID", {});
	console.log("magazines.insert.value=", value);
		//----------------------------------------------------------------
		return await mongodb.insertOne(mongoCFG.Breaststroke.magazine, value);
		//----------------------------------------------------------------
	}

	// find magazines
	static async downloadRanking(query) {
		
		let disciplineTimes = {};
		disciplineTimes.all = await buildTimes(query);

		for (const masters of [true, false]) {
			disciplineTimes[masters?"masters":"elite"] = await buildTimes({ isMasters: masters });
		}
		
		for (const adult of [true, false]) {
			disciplineTimes[adult?"adult":"junior"] = await buildTimes({ isAdult: adult });
		}

		for (const masters of [true, false]) {
			for (const adult of [true, false]) { 
				disciplineTimes[`${masters?"masters":"elite"}-${adult?"adult":"junior"}`] = await buildTimes({ isMasters: masters, isAdult: adult});     
			}
		}

    const filename = `./ranking-all.xlsx`;
		await saveExcel(disciplineTimes, filename)
		
		return filename;
	}
	// insert
	static async insert(body) {
		const value = Customizing.field(body);
		value.magazineID = await mongodb.max(mongoCFG.Breaststroke.magazine, "magazineID", {});
	console.log("magazines.insert.value=", value);
		//----------------------------------------------------------------
		return await mongodb.insertOne(mongoCFG.Breaststroke.magazine, value);
		//----------------------------------------------------------------
	}

	// update
	static async update(body) {
		if (Object.keys(body).length < 2) return utilError.errorMSG("Model","magazines", "update", "field not found");
		const value = Customizing.field(body);
		const query = { magazineID: value.magazineID };

		delete value.magazineID;
	
		//----------------------------------------------------------------
		return await mongodb.updateOne(mongoCFG.Breaststroke.magazine, query, value);
		//----------------------------------------------------------------
	}

	// delete
	static async delete(magazineID) {
		try {
			const query = { magazineID: Number(magazineID) };
			//----------------------------------------------------------------
			return await mongodb.deleteOne(mongoCFG.Breaststroke.magazine, query);
			//----------------------------------------------------------------
		} catch (e) {
			return utilError.errorMSG("Model","magazines", "delete", "catch." + err);
		}
	}

}

module.exports = MagazineModel;

