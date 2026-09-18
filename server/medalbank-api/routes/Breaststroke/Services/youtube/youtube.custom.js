
exports.field = (data) => {
	const value = {};	
	
	if (data.youtubeID	) value.youtubeID = Number(data.youtubeID);
	if (data.title			) value.title = data.title.trim();
	if (data.name				) value.name = data.name.trim();
	if (data.gender			) value.gender = data.gender.trim();
	if (data.discipline	) value.discipline = data.discipline.trim();
	if (data.course			) value.course = data.course.trim();
	if (data.distance		) value.distance = data.distance.trim();
	if (data.round			) value.round = data.round.trim();
	if (data.classCode	) value.classCode = data.classCode.trim();
	if (data.time				) value.time = data.time.trim();
	if (data.timeStamp	) value.timeStamp = data.timeStamp;
	if (data.datetime		) value.datetime = data.datetime.trim();
	if (data.thumbnail	) value.thumbnail = data.thumbnail.trim();
	if (data.href				) value.href = "https://youtube.com" + data.href;
	if (data.duration		) value.duration = data.duration;
	
	if (data.uploadedAt	) value.uploadedAt = data.uploadedAt;
	if (data.views			) value.views = data.views;

	
	return value;
}
