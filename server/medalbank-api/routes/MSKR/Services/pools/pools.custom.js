exports.category = (data) => {
	const value = {};
	if (data.canWrite       ) value.canWrite        = data.canWrite;
	if (data.category       ) value.category        = data.category;
	if (data.categoryKorean ) value.categoryKorean  = data.categoryKorean;

	return value;
}

exports.field = (data) => {
	const value = {};
	value.poolID					= Number(data.poolID) 					|| 0; // ID
	value.name						= data.name 						|| ""; // 수영장 이름
	value.names						= data.names 						|| []; // 수영장 이름
	value.fullname				= data.fullname 				|| ""; // 수영장 이름
	value.sido						= data.sido 						|| ""; // 시도
	value.sido = value.sido.slice(0, 2);
	value.course					= data.course 			|| "";

	if (data.bestTimes)								value.bestTimes     	= data.bestTimes || [];
	if (data.competitions) 						value.competitions  	= data.competitions || [];
	if (data.competitionCount) 				value.competitionCount= data.competitionCount || 0;
	if (data.uploadTimes) 						value.uploadTimes  		= data.uploadTimes || 0;
	
	value.info = {};
	if (data.poolname) 				value.info.poolname 				= data.poolname;	// 수영장 부제
	if (data.nickname) 				value.info.nickname 				= data.nickname;
	if (data.address) 				value.info.address 					= data.address;	// 기본주소
	if (data.addressDRM)			value.info.addressDRM 			= data.addressDRM;	// 상세주소
	if (data.addressDetails)	value.info.addressDetails 	= data.addressDetails;	// 기본주소 (도로명주소)
	if (data.phone) 					value.info.phone 						= data.phone;	// 연락처
	if (data.email) 					value.info.email 						= data.email;	// email
	if (data.website) 				value.info.website 					= data.website;	// 웹사이트
	if (data.dailyPass) 			value.info.dailyPass 				= data.dailyPass;	// 일일입장료
	if (data.lengths) 				value.info.lengths 					= Number(data.lengths);	//  pool 길이
	if (data.lengthUnit) 			value.info.lengthUnit 			= data.lengthUnit;	// pool 길이 단위
	if (data.lanes) 					value.info.lanes 						= Number(data.lanes);	// 레인
	if (data.depthShallowEnd) value.info.depthShallowEnd 	= Number(data.depthShallowEnd);	// 깊이
	if (data.depthDeepEnd) 		value.info.depthDeepEnd 		= Number(data.depthDeepEnd);
	if (data.depthUnit) 			value.info.depthUnit 				= data.depthUnit;	// 깊이 단위
	if (data.coordinateX) 		value.info.coordinateX 			= parseFloat(data.coordinateX);	// 좌표
	if (data.coordinateY) 		value.info.coordinateY 			= parseFloat(data.coordinateY);
	if (data.searchKeywords) 	value.info.searchKeywords 	= data.searchKeywords;	// 네비검색어추천
	if (data.notes) 					value.info.notes 						= data.notes;
	// if (data.competitionCount)value.info.competitionCount	= data.competitionCount;	// 대회 개최 수

	if (data.closestSubwayStation) 		value.info.closestSubwayStation 		= data.closestSubwayStation;	// 가장가까운지하철역
	if (data.dailyPass) 							value.info.dailyPass 								= data.dailyPass;	// 일일입장료
	if (data.closedOn) 								value.info.closedOn 								= data.closedOn;	// 휴관일
	if (data.timeLessonsWeekdays) 		value.info.timeLessonsWeekdays 			= data.timeLessonsWeekdays;	// 강습시간평일
	if (data.timeLapSwimmingWeekdays)	value.info.timeLapSwimmingWeekdays 	= data.timeLapSwimmingWeekdays;	// 자유수영평일
	if (data.timeLapSwimmingSaturdays)value.info.timeLapSwimmingSaturdays	= data.timeLapSwimmingSaturdays;	// 자유수영토요일
	if (data.timeLapSwimmingSundays) 	value.info.timeLapSwimmingSundays 	= data.timeLapSwimmingSundays;	// 자유수영일요일/공휴일
	if (data.isKidsOnly) 							value.info.isKidsOnly 							= true;	// 어린이전용
	if (data.isAdultsOnly) 						value.info.isAdultsOnly 						= true;	// 성인전용
	if (data.hasCanteen) 							value.info.hasCanteen 							= true;	// 매점
	if (data.hasCafe) 								value.info.hasCafe 									= true;	// 카페
	if (data.hasFoodcourt) 						value.info.hasFoodcourt 						= true;	// 식당
	if (data.hasHairdryer) 						value.info.hasHairdryer 						= true;	// 드라이기
	if (data.hasSauna) 								value.info.hasSauna 								= true;	// 사우나
	if (data.hasMassagePool) 					value.info.hasMassagePool 					= true;	// 안마탕 여부
	if (data.hasStartBlock) 					value.info.hasStartBlock 						= true;	// 스타트대
	if (data.hasSoap) 								value.info.hasSoap 									= true;	// 비누
	if (data.hasComb) 								value.info.hasComb 									= true;	// 빗
	if (data.hasFan) 									value.info.hasFan 									= true;	// 선풍기
	if (data.hasCottonBud) 						value.info.hasCottonBud 						= true;	// 면봉
	if (data.hasHangers) 							value.info.hasHangers 							= true;	// 옷걸이
	if (data.hasWaterPurifier) 				value.info.hasWaterPurifier					= true;	// 정수기
	if (data.hasClothesDrier) 				value.info.hasClothesDrier					= true;	// 건조기
	if (data.hasKickboards) 					value.info.hasKickboards 						= true;	// 킥보드대여
	if (data.hasPullbuoys) 						value.info.hasPullbuoys 						= true;	// 풀부이대여
	if (data.hasToiletPaper) 					value.info.hasToiletPaper 					= true;	// 휴지
	if (data.hasBin) 									value.info.hasBin 									= true;	// 쓰레기통
	if (Object.keys(value.info).length == 0) delete value.info;
	
	return value;
}
