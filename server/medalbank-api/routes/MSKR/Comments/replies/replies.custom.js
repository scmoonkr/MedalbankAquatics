const Reaction	= require("../reactions/reactions.custom");

exports.field = (data) => {
	const value = {};
  if (data.commentID    ) value.commentID     = Number(data.commentID);
  if (data.status       ) value.status        = data.status;
  if (data.title        ) value.title         = data.title;
  if (data.excerpt      ) value.excerpt       = data.excerpt;
  if (data.content      ) value.content       = data.content;
  if (data.category     ) value.category      = data.category;
  if (data.tags         ) value.tags          = data.tags;
  if (data.featuredImage) value.featuredImage = data.featuredImage;
  if (data.nickname     ) value.nickname      = data.nickname;
  if (data.userID       ) value.userID        = Number(data.userID);
  if (data.datetime     ) value.datetime      = data.datetime;

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
    datetime      : data.datetime || "", // 일자
  };
  if (data.status       ) value.status        = data.status;
  if (data.excerpt      ) value.excerpt       = data.excerpt;
  if (data.tags         ) value.tags          = data.tags;
  if (data.featuredImage) value.featuredImage = data.featuredImage;
  if (data.nickname     ) value.nickname      = data.nickname;

	if (data.reactions 		) value.reactions  		= Reaction.field(data.reactions);
	if (data.myReactions	) value.myReactions		= Reaction.field(data.myReactions);
	
	return value;
}
