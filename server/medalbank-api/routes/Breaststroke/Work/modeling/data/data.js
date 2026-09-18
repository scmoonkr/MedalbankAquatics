class AthletesModel {
	int athleteID = 0;	
	String name = '';	
	bool masters = false;		// true: masters, false: elite
	bool adult = false;		// true: adult, false: junior
	String gender = '';		// 성별
	String dob = '';		// 생년월일
	String province = '';		// 소속: 서울,인천,…
	String note = '';	
	String nickname = '';	
	String dobTo = '';		// 생년월일
	bool individual = false;		// individual,team
	String nameComp = '';	
	String team = '';		// 팀명
	String avatar = '';	
	List<String> images = [];		// 이미지
	List<String> tags = [];		// [""tag1",tag2"]
	String datetime = '';		// 등록일자
	String nameHide = '';	
	List<TimeModel> times = [];	
	Map<String, dynamic> extraInfo = {};	
		// 'times': '',	
		// 'medals': '',	
		// 'gold': '',	
		// 'silver': '',	
		// 'bronze': '',	
		// 'styleCount': '',	
		// 'name': '',	
		// 'year': '',	
		// 'styleDistance': '',	
		// 'timeID': '',		// count, timeID, times, top, rank, style, distance
		// 'count': '',	
		// 'teams': '',	
		// 'team': '',	
		// 'year': '',	
		// 'points': '',	
		// 'style': '',		// freestyle
		// 'total': '',	
		// '50M': '',	
		// 'previous': '',		// timeID,category,gender,ageGroup,style,course,rank,times,datetime,name,team,competitionID,competitionName,
		// 'style': '',	
		// 'total': '',	
		// 'best': '',	
		// 'style': '',	
		// 'total': '',	
AthletesModel({
	athleteID = 0,
	name = '',
	masters = false,
	adult = false,
	gender = '',
	dob = '',
	province = '',
	note = '',
	nickname = '',
	dobTo = '',
	individual = false,
	nameComp = '',
	team = '',
	avatar = '',
	images,
	tags,
	datetime = '',
	nameHide = '',
	times,
	extraInfo,
	});

AthletesModel.fromJson(Map<String, dynamic> json) {
	athleteID = json['athleteID'] || 0;	
	name = json['name'] || '';	
	masters = json['masters'] || false;		// true: masters, false: elite
	adult = json['adult'] || false;		// true: adult, false: junior
	gender = json['gender'] || '';		// 성별
	dob = json['dob'] || '';		// 생년월일
	province = json['province'] || '';		// 소속: 서울,인천,…
	note = json['note'] || '';	
	nickname = json['nickname'] || '';	
	dobTo = json['dobTo'] || '';		// 생년월일
	individual = json['individual'] || false;		// individual,team
	nameComp = json['nameComp'] || '';	
	team = json['team'] || '';		// 팀명
	avatar = json['avatar'] || '';	
	images = json['images'] == null ? [] : json['images'].cast<String>();
	tags = json['tags'] == null ? [] : json['tags'].cast<String>();
	datetime = json['datetime'] || '';		// 등록일자
	nameHide = json['nameHide'] || '';	
	times = json['times'] || [];	
	times = [];
	if (json['times'] != null) {
		json['times'].forEach(
			(v) {
				times.add(TimeModel.fromJson(v));
			},
		);
	}
	extraInfo = json['extraInfo'] || {};	
	}

Map<String, dynamic> toJson() {
	final Map<String, dynamic> data = {};

	data['athleteID'] = athleteID;
	data['name'] = name;
	data['masters'] = masters;
	data['adult'] = adult;
	data['gender'] = gender;
	data['dob'] = dob;
	data['province'] = province;
	data['note'] = note;
	data['nickname'] = nickname;
	data['dobTo'] = dobTo;
	data['individual'] = individual;
	data['nameComp'] = nameComp;
	data['team'] = team;
	data['avatar'] = avatar;
	data['images'] = images;
	data['tags'] = tags;
	data['datetime'] = datetime;
	data['nameHide'] = nameHide;
	if (times.isNotEmpty) {
		data['times'] = times.map((v) => v.toJson()).toList();
	}
	data['extraInfo'] = extraInfo;

	return data;
}

static AthletesModel initialize() {	AthletesModel data = AthletesModel();
	data.athleteID = 0;
	data.name = '';
	data.masters = false;
	data.adult = false;
	data.gender = '';
	data.dob = '';
	data.sido = '';
	data.note = '';
	data.nickname = '';
	data.dobTo = '';
	data.individual = false;
	data.nameComp = '';
	data.team = '';
	data.avatar = '';
	data.images = [];
	data.tags = [];
	data.datetime = '';
	data.nameHide = '';
	data.times = [];
	data.extraInfo = {};

	return data;
	}

 }
