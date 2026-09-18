exports.category = (data) => {
	const value = {};
  if (data.canWrite       ) value.canWrite        = data.canWrite;
  if (data.category       ) value.category        = data.category;
  if (data.categoryKorean ) value.categoryKorean  = data.categoryKorean;

  return value;
}

exports.field = (data) => {
	const value = {}
  value.teamID = Number(data.teamID);
	value.name = data.name || '';
	if (data.names						) value.names = typeof data.names == 'string' ? data.names.split(',') : data.names;

	if (data.nameKor					) value.nameKor = data.nameKor;
	if (data.nameEng					) value.nameEng = data.nameEng;
	if (data.fullname					) value.fullname = data.fullname;
	if (data.logo							) value.logo = data.logo;
	if (data.featured					) value.featured = data.featured;
	if (data.masters					) value.masters = data.masters;
	if (data.adult						) value.adult = data.adult;
	if (data.status						) value.status = data.status;
	if (data.isVerified				) value.isVerified = data.isVerified;
	if (data.teamCode					) value.teamCode = data.teamCode;
	if (data.teamClass				) value.teamClass = data.teamClass;
	if (data.representatives	) value.representatives = data.representatives;
	if (data.coaches					) value.coaches = data.coaches;
	if (data.sponsers					) value.sponsers = data.sponsers;
	if (data.email						) value.email = data.email;
	if (data.phone						) value.phone = data.phone;
	if (data.city							) value.city = data.city;
	if (data.pools						) value.pools = data.pools;
	if (data.tags							) value.tags = data.tags;
	if (data.website					) value.website = data.website;
	if (data.instagram				) value.instagram = data.instagram;
	if (data.twitter					) value.twitter = data.twitter;
	if (data.datetime					) value.datetime = data.datetime;

	if (data.competitionCount	) value.competitionCount = data.competitionCount;
	if (data.firstDate				) value.firstDate = data.firstDate;
	if (data.latestDate				) value.latestDate = data.latestDate;
	if (data.medals						) value.medals = data.medals;
	if (data.members					) value.members = data.members;
	if (data.points						) value.points = data.points;
	if (data.rank							) value.rank = data.rank;
	if (data.style						) value.style = data.style;
	if (data.timeCount				) value.timeCount = data.timeCount;

	if (data.extraInfo				) value.extraInfo = data.extraInfo;
	return value;
}

exports.TeamCustom = {
  category: (data) => {
    const value = {};
    if (data.canWrite       ) value.canWrite        = data.canWrite;
    if (data.category       ) value.category        = data.category;
    if (data.categoryKorean ) value.categoryKorean  = data.categoryKorean;
  
    return value;
  },

  field: (data) => {
	const value = {};
  if (data.nickname     ) value.nickname   = data.nickname;
  if (data.userID       ) value.userID     = Number(data.userID);
  if (data.categories   ) value.categories = data.categories.map(cat => this.category(cat));

  return value;
  }

}