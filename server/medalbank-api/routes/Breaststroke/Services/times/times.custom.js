const utilLibrary = require("../../Class/utilLibrary");
const mskCFG 		  = require('../../Config/mskCFG');
const DateLibrary = require("../../Class/DateLibrary");
const utilDate	  = new DateLibrary();

exports.customizing = (data) => {
  const value = {
    timeID    : data.timeID || 0,
    name      : data.name || "",      
    // athleteID : Number(data.athleteID), // athletes.athleteID
    gender    : data.gender || "", // 성별
    discipline: data.discipline || "", // 종목
    course    : data.course || "", // 코스
    distance  : data.distance || "", // 거리
    time      : data.time || "", // 기록      
    timeStamp : data.timeStamp || 0, // 기록           
  }
  if (data.athleteID    ) value.athleteID    = Number(data.athleteID); 
  // console.log("data.athleteID=", data.athleteID, "value=", value.athleteID);
  if (data.competitionID) value.competitionID = Number(data.competitionID);
  if (data.competitionName) value.competitionName = data.competitionName;
  if (data.stem         ) value.stem          = data.stem;
  if (data.stemID       ) value.stemID        = Number(data.stemID);
  if (data.team         ) value.team          = data.team;
  if (data.teamID       ) value.teamID        = Number(data.teamID);
  if (data.lane         ) value.lane          = data.lane;
  if (data.heat         ) value.heat          = data.heat;
  if (data.pool         ) value.pool          = data.pool;
  if (data.poolID       ) value.poolID        = Number(data.poolID);
  if (data.source       ) value.source        = data.source;
  if (data.timeORG      ) value.timeORG       = data.timeORG;
  if (data.featured     ) value.featured      = data.featured;
  if (data.isMasters != undefined) value.isMasters     = data.isMasters;
  if (data.isAdult != undefined) value.isAdult       = data.isAdult;
  if (data.isIndividual ) value.isIndividual  = data.isIndividual;
  if (data.isOfficial   ) value.isOfficial    = data.isOfficial;
  if (data.type         ) value.type          = data.type;
  if (data.ageGroup     ) value.ageGroup      = data.ageGroup;
  if (data.ageGroupCode ) value.ageGroupCode  = data.ageGroupCode;
  if (data.round        ) value.round         = data.round;
  // if (data.timeStamp    ) value.timeStamp     = data.timeStamp;
  if (data.rank         ) value.rank          = Number(data.rank);
  if (data.sido         ) value.sido          = data.sido;
  if (data.names        ) value.names         = data.names;
  if (data.datetime     ) value.datetime      = typeof data.datetime == 'string' ? data.datetime : new Date(data.datetime).toISOString().slice(0, 10);
  if (data.note         ) value.note          = data.note;
  if (data.caps         ) value.caps          = data.caps;
  if (data.swimwears    ) value.swimwears     = data.swimwears;
  if (data.starts       ) value.starts        = data.starts;
  if (data.depths       ) value.depths        = data.depths;
  if (data.temperatures ) value.temperatures  = data.temperatures;
  if (data.memo         ) value.memo          = data.memo;
  if (data.timekeeper   ) value.timekeeper    = data.timekeeper;
  if (data.status       ) value.status        = data.status;
  if (data.isPrivate != undefined) value.isPrivate     = data.isPrivate;
  if (data.PB           ) value.PB            = data.PB;

  return value;
}
