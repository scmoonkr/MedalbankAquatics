
exports.field = (data) => {
	const value = {
		competitionID		: Number(data.competitionID) 		|| 0,
		fullname				: data.fullname 				|| "", // 대회명
		// name						: data.name 						|| "",
	}
	value.name = data.name ? data.name : value.name = value.fullname;

	if (data.order)					value.order = Number(data.order);
	if (data.stem)					value.stem = data.stem;
	if (data.stemID)				value.stemID = Number(data.stemID);
	if (data.poolID)				value.poolID = Number(data.poolID);
	if (data.pool)					value.pool = data.pool;
	if (data.sido)					value.sido = data.sido;
	if (data.course)				value.course = data.course;
	if (data.measured)			value.measured = data.measured;
	if (data.target)				value.target = data.target;
	if (data.masters) 			value.masters = data.masters;
	if (data.priority) 			value.priority = data.priority;

	if (data.hosts)					value.hosts = data.hosts;
	if (data.hosts == '-')	value.hosts = '';
	if (data.managers)			value.managers = data.managers;
	if (data.supporters)		value.supporters = data.supporters;
	if (data.sponsers)			value.sponsers = data.sponsers;
	if (data.address) 			value.address = data.address;
	if (data.email) 				value.email = data.email;
	if (data.website) 			value.website = data.website;
	if (data.phone) 				value.phone = data.phone;
	
	if (data.ageGroup)  {
		value.ageGroup = typeof data.ageGroup == "string" ? data.ageGroup.split(',') : data.ageGroup;
	}
	if (data.tags)  {
		value.tags = typeof data.tags == "string" ? [] : data.tags;
	}
	if (data.grade) 						value.grade = data.grade;
	if (data.styles) 						value.styles = data.styles;
	if (data.entryLimits)				value.entryLimits = data.entryLimits;
	if (data.featuredImage) 		value.featuredImage = data.featuredImage;
	if (data.outlines) 					value.outlines = data.outlines.toString();
	if (data.recordFile) 				value.recordFile = data.recordFile;
	if (data.recordExcel) 			value.recordExcel = data.recordExcel;
	if (data.timesFile) 				value.timesFile = data.timesFile;
	if (data.timesExcel) 				value.timesExcel = data.timesExcel;
	if (data.images)  {
		value.images = typeof data.images == "string" ? [] : data.images;
	}
	if (data.note) 							value.note = data.note;

	value.extraInfo = data.extraInfo || {};

	if (data.entryFeePerPerson) value.extraInfo.info.entryFeePerPerson = data.entryFeePerPerson
	if (data.entryFeePerRelay	) value.extraInfo.info.entryFeePerRelay	= data.entryFeePerRelay
	if (data.entryFeePerPros	) value.extraInfo.info.entryFeePerPros 	= data.entryFeePerPros
	if (data.prizeCash				) value.extraInfo.info.prizeCash 				= data.prizeCash
	if (data.prizeMeals				) value.extraInfo.info.prizeMeals 				= data.prizeMeals
	if (data.prizeCertificates) value.extraInfo.info.prizeCertificates = data.prizeCertificates
	if (data.gifts						) value.extraInfo.info.gifts 						= data.gifts

	if (data.dateStart				)	value.dateStart = new Date(data.dateStart).toISOString().slice(0, 10);
	if (data.year) {
		value.year = Number(data.year);
	} else {
		if (data.dateStart) value.year = new Date(data.dateStart).getFullYear();
	}
	if (data.dateEnd					)	value.dateEnd = new Date(data.dateEnd).toISOString().slice(0, 10);
	if (data.dateStartSignup	)	value.dateStartSignup = new Date(data.dateStartSignup).toISOString().slice(0, 10);
	if (data.dateEndSignup		) value.dateEndSignup = new Date(data.dateEndSignup).toISOString().slice(0, 10);
	if (data.dateStartReceipt	)	value.dateStartReceipt = new Date(data.dateStartReceipt).toISOString().slice(0, 10);
	if (data.dateEndReceipt		) value.dateEndReceipt = new Date(data.dateEndReceipt).toISOString().slice(0, 10);

	

	value.timeCount 		= data.timeCount || 0;
	value.athleteCount	= data.athleteCount || 0;


	return value;
}
