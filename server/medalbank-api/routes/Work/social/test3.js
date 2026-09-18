
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
