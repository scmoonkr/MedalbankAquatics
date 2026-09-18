
exports.field = (data) => {
  const value = {
    competitionID : data.competitionID || 0,
    timeID    		: data.timeID || 0,
    athleteID 		: data.athleteID ?? 0, // athletes.athleteID
    name      		: data.name || "",      
    gender    		: data.gender || "", // 성별
    style     		: data.style || "", // 종목
    course    		: data.course || "", // 코스
    distance  		: data.distance || "", // 거리
    time      		: data.time || "", // 기록      
    timeStamp  		: data.timeStamp ||0.0, // 기록           
  }
  // if (value.athleteID == 0) value.athleteID = 99999;
  if (value.athleteID == 0) value.name = data.nameHide;
  if (data.competitionName) value.competitionName = data.competitionName;
  if (data.stemID       ) value.stemID        = Number(data.stemID);
  if (data.team         ) value.team          = data.team;
  if (data.teamID       ) value.teamID        = Number(data.teamID);
  if (data.poolID       ) value.poolID        = Number(data.poolID);
  if (data.pool         ) value.pool          = data.pool;
  if (data.isMasters    ) value.isMasters     = data.isMasters;
  if (data.isAdult      ) value.isAdult       = data.isAdult;
  if (data.type         ) value.type          = data.type;
  if (data.rank         ) value.rank          = data.rank;
  if (data.ageGroup     ) value.ageGroup      = data.ageGroup;
  if (data.datetime     ) value.datetime      = data.datetime;
  if (data.status       ) value.status        = data.status;
	
	return value;
}
