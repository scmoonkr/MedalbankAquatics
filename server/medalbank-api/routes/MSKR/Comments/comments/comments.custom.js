const Reaction	= require("../reactions/reactions.custom");
const Reply	    = require("../replies/replies.custom");

exports.field = (data) => {
	const value = {};
  if (data.commentID    ) value.commentID     = Number(data.commentID);
  if (data.dbType       ) value.dbType        = data.dbType;
  if (data.dbID         ) value.dbID          = data.dbID;
	if (data.parentID     ) value.parentID      = Number(data.parentID);
	if (data.rootCID      ) value.rootCID       = data.rootCID;
  if (data.status       ) value.status        = data.status;
  if (data.title        ) value.title         = data.title;
  if (data.excerpt      ) value.excerpt       = data.excerpt;
  if (data.content      ) value.content       = data.content;
  if (data.category     ) value.category      = data.category;
  if (data.tags         ) value.tags          = data.tags;
  if (data.featuredImage) value.featuredImage = data.featuredImage;
  if (data.nickname     ) value.nickname      = data.nickname;
  if (data.userID       ) value.userID        = Number(data.userID);
  if (data.created      ) value.created       = new Date(data.created).toISOString();
  if (data.updated      ) value.updated       = new Date(data.updated).toISOString();
  if (data.deleted      ) value.deleted       = new Date(data.deleted).toISOString();

	// replies
	if (data.replyCount   ) value.replyCount    = data.replyCount || 0;
	if (data.replies 		  ) value.replies  		  = data.replies.map(reply => Reply.field(reply));
	if (data.reactions 		) value.reactions  		= Reaction.field(data.reactions);
	if (data.myReactions	) value.myReactions		= Reaction.field(data.myReactions);

  return value;
}

exports.list = (data) => {
	const value = {
    commentID     : data.commentID|| 0,
    title         : data.title    || "", // 제목
    category      : data.category || "", // category
    // content       : data.content  || "", // 내용
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

	// replies
	if (data.replyCount   ) value.replyCount    = data.replyCount || 0;
	if (data.replies 		  ) value.replies  		  = data.replies;
	if (data.reactions 		) value.reactions  		= Reaction.field(data.reactions);
	if (data.myReactions	) value.myReactions		= Reaction.field(data.myReactions);
	
	return value;
}

exports.detail = (data) => {
  
  const value = {
		communityID		: data.communityID || 0,
		status				: data.status || "", // 
		title					: data.title || "", // 제목
		excerpt				: data.excerpt || "", // 요약
		content				: data.content || "", // 내용
		category			: data.category || "", // category
    categories		: data.categories || [],
    best          : data.best || false,
    issue         : data.issue || false,
		tags					: data.tags || [], // 태그
		images				: data.images || [], // images
		featured			: data.featured || "", // 이미지
		nickname			: data.nickname || "", // 닉네임
		userID				: data.userID || 0, // 아이디
		reactions			: data.reactions || {},
		myReactions		: data.myReactions || {},
		commentCount	: data.commentCount || 0,
		comments			: data.comments || [],
	}
  if (data.created      ) value.created       = new Date(data.created).toISOString();
  if (data.updated      ) value.updated       = new Date(data.updated).toISOString();
  if (data.deleted      ) value.deleted       = new Date(data.deleted).toISOString();
  // value.comments = value.comments.reduce((arr, comment) => {
  //                                 comment.category = value.category;
  //                                 arr.push(Customizing.comment(comment));
  //                                 return arr;
  //                               }, [])
  if (!value.category && value.categories && value.categories.length > 0) value.category = value.categories[0];
  return value;
}