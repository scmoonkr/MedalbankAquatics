
const mongoCFG 	= require('../../Config/mongoCFG');
const mongoDB		= require('../../Class/MongoDB');
const CustomReaction		= require('../../Models/Customizing/reactions.custom');
const ObjectID 	= require('mongodb').ObjectID;

const mongodb 	  = new mongoDB(mongoCFG.Medalbank.database);

exports.listView = async (body) => {
  
  var dbType  = body.dbType;
  var dbID    = Number(body.dbID);
  var userID  = Number(body.userID);

  const aggregate =[
    { $match: { rootCID: 1 } },
    { $lookup: {
        from: mongoCFG.Medalbank.reactions,
        let: { dbType: dbType, dbID: "$commentID" }, // 여기서 사용자 ID 지정
        pipeline: [
            { $match:
              { $expr:
                { $and: [
                    { $eq: ["$dbType", "$$dbType"] },
                    { $eq: ["$dbID", "$$dbID"] }
                  ]
                }
              } 
            },
            { $group: {
              _id: null,
              likes     	: { $sum: "$likes" 	  		},
              dislikes  	: { $sum: "$dislikes" 	  },
              blinds    	: { $sum: "$blinds" 	  	},
              pins      	: { $sum: "$pins" 	  		},
              captures  	: { $sum: "$captures" 	  },
              shares    	: { $sum: "$shares" 	  	},
              views     	: { $sum: "$views" 	  		},
              follows     : { $sum: "$follows" 	    },
              followedBys	: { $sum: "$followedBys"	},
            
              pizzas    	: { $avg: "$pizzas" 	  	},
              ratings   	: { $avg: "$ratings" 	    }
            }
          }
        ],
        as: "reactions"
      }
    },
    { $lookup: {
      from: mongoCFG.Medalbank.reactions,
        let: { dbType: dbType, dbID: "$commentID", userID: userID }, // 여기서 사용자 ID 지정
        pipeline: [
            { $match:
              { $expr:
                { $and: [
                    { $eq: ["$dbType", "$$dbType"] },
                    { $eq: ["$dbID", "$$dbID"] },
                    { $eq: ["$userID", "$$userID"] }
                  ]
                }
              } 
            },
            { $group: {
              _id: null,
              likes     	: { $sum: "$likes" 	  		},
              dislikes  	: { $sum: "$dislikes" 	  },
              blinds    	: { $sum: "$blinds" 	  	},
              pins      	: { $sum: "$pins" 	  		},
              captures  	: { $sum: "$captures" 	  },
              shares    	: { $sum: "$shares" 	  	},
              views     	: { $sum: "$views" 	  		},
              follows     : { $sum: "$follows" 	    },
              followedBys	: { $sum: "$followedBys"	},
            
              pizzas    	: { $avg: "$pizzas" 	  	},
              ratings   	: { $avg: "$ratings" 	    }
            }
          }
        ],
        as: "myReactions"
      }
    }
  ]
  const result = await mongodb.aggregate(mongoCFG.Medalbank.socialMedias, aggregate);
  // console.log(result.data);

}

(async () => {

  const context = {
    // query: { postId: 1 },
    query: {},
    projection: { _id:0, commentID:1, title:1, },
  }
  const result1 = await mongodb.find(mongoCFG.Medalbank.socialMedias, context);

  for (const social of result1.data) {
    const value = { content: "content: " + social.title }
    await mongodb.updateOne(mongoCFG.Medalbank.socialMedias, { commentID: social.commentID }, value);
  }

  console.log(result1.data);
  return;

  var dbType = "comment"
  var dbID = 1
  var userID = 1

  const aggregate =[
    { $match: { rootCID: 1 } },
    { $lookup: {
        from: mongoCFG.Medalbank.reactions,
        let: { dbType: dbType, dbID: "$commentID" }, // 여기서 사용자 ID 지정
        pipeline: [
            { $match:
              { $expr:
                { $and: [
                    { $eq: ["$dbType", "$$dbType"] },
                    { $eq: ["$dbID", "$$dbID"] }
                  ]
                }
              } 
            },
            { $group: {
              _id: null,
              likes     	: { $sum: "$likes" 	  		},
              dislikes  	: { $sum: "$dislikes" 	  },
              blinds    	: { $sum: "$blinds" 	  	},
              pins      	: { $sum: "$pins" 	  		},
              captures  	: { $sum: "$captures" 	  },
              shares    	: { $sum: "$shares" 	  	},
              views     	: { $sum: "$views" 	  		},
              follows     : { $sum: "$follows" 	    },
              followedBys	: { $sum: "$followedBys"	},
            
              pizzas    	: { $avg: "$pizzas" 	  	},
              ratings   	: { $avg: "$ratings" 	    }
            }
          }
        ],
        as: "reactions"
      }
    },
    { $lookup: {
      from: mongoCFG.Medalbank.reactions,
        let: { dbType: dbType, dbID: "$commentID", userID: userID }, // 여기서 사용자 ID 지정
        pipeline: [
            { $match:
              { $expr:
                { $and: [
                    { $eq: ["$dbType", "$$dbType"] },
                    { $eq: ["$dbID", "$$dbID"] },
                    { $eq: ["$userID", "$$userID"] }
                  ]
                }
              } 
            },
            { $group: {
              _id: null,
              likes     	: { $sum: "$likes" 	  		},
              dislikes  	: { $sum: "$dislikes" 	  },
              blinds    	: { $sum: "$blinds" 	  	},
              pins      	: { $sum: "$pins" 	  		},
              captures  	: { $sum: "$captures" 	  },
              shares    	: { $sum: "$shares" 	  	},
              views     	: { $sum: "$views" 	  		},
              follows     : { $sum: "$follows" 	    },
              followedBys	: { $sum: "$followedBys"	},
            
              pizzas    	: { $avg: "$pizzas" 	  	},
              ratings   	: { $avg: "$ratings" 	    }
            }
          }
        ],
        as: "myReactions"
      }
    }
  ]
  const result = await mongodb.aggregate(mongoCFG.Medalbank.comments, aggregate);
  // console.log(result.data);


  // 예를 들어, MongoDB에서 가져온 댓글과 대댓글의 데이터
  const commentsData = result.data;

  // 데이터 재구성
  const organizedComments = organizeComments(commentsData);

  // 결과 확인
  console.log("++++++++++", JSON.stringify(organizedComments, null, '  '));

})();

// 부모 ID를 기준으로 댓글을 분류하는 함수
function organizeComments(comments) {
  let commentsMap = {};
  
  // 댓글을 ID를 키로 하여 맵에 저장
  comments.forEach(comment => {
    commentsMap[comment.commentID] = comment;
    comment.replies = [];
  });
  // console.log(commentsMap);

  // 각 댓글에 대해 부모 댓글의 replies 배열에 추가
  comments.forEach(comment => {
    if (comment.commentID != comment.parentID && commentsMap[comment.parentID]) {
      commentsMap[comment.parentID].replies.push(comment);
    }
  });
  // console.log(JSON.stringify(commentsMap, null, '  '));

  // 최상위 댓글만 반환
  return comments.filter(comment => comment.commentID == comment.parentID);
}

const json = [
  {
    "title": "post 1 - comment 1",
    "dbID": 1,
    "dbType": "post",
    "parentID": 1,
    "commentID": 1,
    "parentCID": 1,
    "created": "2023-09-20T15:39:20.000Z",
    "category": "announcements",
    "nickname": "stmoonkr",
    "userID": 1,
    "replies": [
      {
        "title": "post 1 - comment 1 - reply 13",
        "dbID": 1,
        "dbType": "post",
        "parentID": 1,
        "commentID": 13,
        "parentCID": 1,
        "created": "2023-11-05T10:39:20.000Z",
        "category": "ssuls",
        "nickname": "aiden",
        "userID": 2,
        "replies": [
          {
            "title": "post 1 - comment 1 - reply 13 - reply 17",
            "dbID": 1,
            "dbType": "post",
            "parentID": 13,
            "commentID": 17,
            "parentCID": 1,
            "created": "2023-12-02T10:39:20.000Z",
            "category": "ssuls",
            "nickname": "aiden",
            "userID": 2,
            "replies": [
              {
                "title": "post 1 - comment 1 - reply 13 - reply 17 - reply 22",
                "dbID": 1,
                "dbType": "post",
                "parentID": 17,
                "commentID": 22,
                "parentCID": 1,
                "created": "2024-01-02T11:39:20.777Z",
                "nickname": "chancemoon",
                "userID": 3,
                "category": "events",
                "replies": []
              },
              {
                "title": "post 1 - comment 1 - reply 13 - reply 17 - reply 23",
                "dbID": 1,
                "dbType": "post",
                "parentID": 17,
                "commentID": 23,
                "parentCID": 1,
                "created": "2024-01-02T11:39:20.777Z",
                "nickname": "chancemoon",
                "userID": 3,
                "category": "events",
                "replies": []
              },
              {
                "title": "post 1 - comment 1 - reply 13 - reply 17 - reply 24",
                "dbID": 1,
                "dbType": "post",
                "parentID": 17,
                "commentID": 24,
                "parentCID": 1,
                "created": "2024-01-02T11:39:20.777Z",
                "nickname": "chancemoon",
                "userID": 3,
                "category": "events",
                "replies": []
              }
            ]
          },
          {
            "title": "post 1 - comment 1 - reply 13 - reply 18",
            "dbID": 1,
            "dbType": "post",
            "parentID": 13,
            "commentID": 18,
            "parentCID": 1,
            "created": "2023-12-02T10:39:20.000Z",
            "category": "ssuls",
            "nickname": "aiden",
            "userID": 2,
            "replies": []
          },
          {
            "title": "post 1 - comment 1 - reply 13 - reply 19",
            "dbID": 1,
            "dbType": "post",
            "parentID": 13,
            "commentID": 19,
            "parentCID": 1,
            "created": "2023-12-02T10:39:20.000Z",
            "category": "ssuls",
            "nickname": "aiden",
            "userID": 2,
            "replies": []
          },
          {
            "title": "post 1 - comment 1 - reply 13 - reply 20",
            "dbID": 1,
            "dbType": "post",
            "parentID": 13,
            "commentID": 20,
            "parentCID": 1,
            "created": "2023-12-02T10:39:20.000Z",
            "category": "ssuls",
            "nickname": "aiden",
            "userID": 2,
            "replies": []
          },
          {
            "title": "post 1 - comment 1 - reply 13 - reply 21",
            "dbID": 1,
            "dbType": "post",
            "parentID": 13,
            "commentID": 21,
            "parentCID": 1,
            "created": "2024-01-02T11:39:20.777Z",
            "nickname": "chancemoon",
            "userID": 3,
            "category": "events",
            "replies": []
          }
        ]
      },
      {
        "title": "post 1 - comment 1 - reply 14",
        "dbID": 1,
        "dbType": "post",
        "parentID": 1,
        "commentID": 14,
        "parentCID": 1,
        "created": "2023-11-05T10:39:20.000Z",
        "category": "ssuls",
        "nickname": "aiden",
        "userID": 2,
        "replies": []
      },
      {
        "title": "post 1 - comment 1 - reply 15",
        "dbID": 1,
        "dbType": "post",
        "parentID": 1,
        "commentID": 15,
        "parentCID": 1,
        "created": "2023-11-05T10:39:20.000Z",
        "category": "ssuls",
        "nickname": "aiden",
        "userID": 2,
        "replies": []
      },
      {
        "title": "post 1 - comment 1 - reply 16",
        "dbID": 1,
        "dbType": "post",
        "parentID": 1,
        "commentID": 16,
        "parentCID": 1,
        "created": "2023-12-02T10:39:20.000Z",
        "category": "ssuls",
        "nickname": "aiden",
        "userID": 2,
        "replies": []
      }
    ]
  },
  {
    "title": "post 1 - comment 2",
    "dbID": 1,
    "dbType": "post",
    "parentID": 2,
    "commentID": 2,
    "parentCID": 2,
    "created": "2023-09-20T15:39:20.000Z",
    "category": "announcements",
    "nickname": "stmoonkr",
    "userID": 1,
    "replies": []
  },
  {
    "title": "post 1 - comment 3",
    "dbID": 1,
    "dbType": "post",
    "parentID": 3,
    "commentID": 3,
    "parentCID": 3,
    "created": "2023-09-20T15:39:20.000Z",
    "category": "announcements",
    "nickname": "stmoonkr",
    "userID": 1,
    "replies": []
  },
  {
    "title": "post 1 - comment 4",
    "dbID": 1,
    "dbType": "post",
    "parentID": 4,
    "commentID": 4,
    "parentCID": 4,
    "created": "2023-09-20T15:39:20.000Z",
    "category": "announcements",
    "nickname": "stmoonkr",
    "userID": 1,
    "replies": []
  }
]
