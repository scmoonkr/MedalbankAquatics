const utilLibrary = require("../../Util/utilLibrary");

exports.customizing = (data) => {
  const value = {
    athleteID     : data.athleteID  || 0,
    // userID        : data.userID     || 0,
    name          : data.name       || "",
    names         : data.names      || "",
    nameComp      : data.nameComp   || "",
    // nameHide      : utilLibrary.nameHide(data.name),
		nameHide			: data.conscent ? data.name : data.nameHide,
		// isMasters     : data.masters    || true,
		// isAdult       : data.adult     	|| true,
		// isIndividual  : data.individual || true,
    // ageGroup      : data.ageGroup   || "",
    gender        : data.gender     || "",
    // dob           : data.dob        || "",
    // sido      		: data.sido   		|| "",
    // note          : data.note       || "",
  }
  value.athleteID =Number(data.athleteID);
	
	if (data.masters				) value.isMasters 	= data.masters == "masters";
	if (data.adult					) value.isAdult 		= data.adult == "adult";
	// if (data.individual			) value.isIndividual = data.individual == "masters";

	if (data.majorTimes			) value.majorTimes 	= data.majorTimes;
	if (data.latestTimes		) value.latestTimes = data.latestTimes;
	if (data.nameEng				) value.nameEng 		= data.nameEng;
	if (data.nickname				) value.nickname 		= data.nickname;
	if (data.ageGroup				) value.ageGroup 		= data.ageGroup;
	if (data.dob						) value.dob 				= data.dob;
	if (data.dobTo					) value.dobTo 			= data.dobTo;
	if (data.team						) value.team 				= data.team;
	if (data.note						) value.note 				= data.note;
	if (data.sido						) value.sido 				= data.sido;
	if (data.teamID					) value.teamID 			= data.teamID;
	if (data.avatar					) value.avatar 			= data.avatar;
	if (data.images					) value.images 			= data.images;
	if (data.tags						) value.tags 				= data.tags;
	if (data.datetime				) value.datetime 		= data.datetime;

	if (data.times) {
		value.times = [];
		for (const time of data.times) {
			value.times.push({
				timeID					: time.timeID,
				name						: time.name,
				// nameHide				: data.conscent ? time.name : time.nameHide,
				// athleteID				: time.athleteID,
				style						: time.style,
				// gender					: time.gender,
				distance				: time.distance,
				// ageGroup				: time.ageGroup,
				times						: time.times,
				rank						: time.rank,
				// team						: time.team,
				competitionID		: time.competitionID,
				competitionName	: time.competitionName,
				datetime				: time.datetime,
			});
		}
	}
	if (data.conscent) value.nameHide = value.name;
	if (data.extraInfo) value.extraInfo = data.extraInfo;

  return value;
}