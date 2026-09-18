exports.field = (data) => {
	const value = {}
	value.youtubeID = data.youtubeID;
	value.title = data.title;
	if (data.name	) value.name = data.name;
	if (data.gender	) value.gender = data.gender;
	if (data.discipline	) value.discipline = data.discipline;
	if (data.course	) value.course = data.course;
	if (data.time	) value.time = data.time;
	if (data.timeStamp	) value.timeStamp = data.timeStamp;
	if (data.datetime	) value.datetime = data.datetime;
	value.thumbnail = data.thumbnail;
	value.href = data.href;
	value.duration = data.duration;
	value.uploadedAt = data.uploadedAt;
	value.views = data.views;
		return value;
}
