// const Comment		= require("./comments.custom");
// const CustomReaction	= require("./reactions.custom");

exports.field = (data={}) => {
	const value = {};
	if (data.check					) value.check					= data.check;
	if (data.userID					) value.userID				= Number(data.userID);
	if (data.athleteID			) value.athleteID			= Number(data.athleteID);
	if (data.name						) value.name					= data.name;
	if (data.nameEng				) value.nameEng				= data.nameEng;
	if (data.nickname				) value.nickname			= data.nickname;
	// if (data.password				) value.password			= data.password;
	if (data.registrationNo	) value.registrationNo= data.registrationNo;
	if (data.nationalCode  	) value.nationalCode	= data.nationalCode;
	if (data.gender					) value.gender				= data.gender;
	if (data.dob						) value.dob						= data.dob;
	if (data.phone					) value.phone					= data.phone;
	if (data.email					) value.email					= data.email;
	if (data.poolID					) value.poolID				= Number(data.poolID);
	if (data.pool						) value.pool					= data.pool;
	if (data.instagram			) value.instagram			= data.instagram;
	if (data.avatar					) value.avatar				= data.avatar;
	if (data.featuredImage	) value.featuredImage = data.featuredImage;
	if (data.sido						) value.sido					= data.sido;
	if (data.gugun					) value.gugun					= data.gugun;
	if (data.authority			) value.authority			= data.authority;
	if (data.team						) value.team					= data.team;
	if (data.teamID					) value.teamID				= Number(data.teamID);
	if (data.teams					) value.teams					= data.teams;

	if (data.isPublic				) value.isPublic			= data.isPublic;
	if (data.note						) value.note					= data.note;

	// comments

	return value;
}

exports.list = (data) => {
	const value = {
		commentID     : data.commentID|| 0,
		title         : data.title    || "", // 제목
		category      : data.category || "", // category
		content       : data.content  || "", // 내용
		userID        : data.userID   || 0, // 닉네임
	};
	if (data.created      ) value.created       = new Date(data.created).toISOString();
	if (data.updated      ) value.updated       = new Date(data.updated).toISOString();
	if (data.deleted      ) value.deleted       = new Date(data.deleted).toISOString();
	if (data.status       ) value.status        = data.status;
	if (data.excerpt      ) value.excerpt       = data.excerpt;
	if (data.tags         ) value.tags          = data.tags;
	if (data.featuredImage) value.featuredImage = data.featuredImage;
	if (data.nickname     ) value.nickname      = data.nickname;

	// comments
	if (data.commentCount ) value.commentCount  = data.commentCount;
	if (data.comments 		) value.comments  		= data.comments;
	if (data.reactions 		) value.reactions  		= Reaction.field(data.reactions);
	if (data.myReactions	) value.myReactions		= Reaction.field(data.myReactions);
	
	return value;
}