
const {CommonQuery}      = require("../Query/common.query");

exports.reactionQuery = (dbType, dbID, userID) => {
  const aggregate = [
    { $match: { dbType: dbType, dbID: dbID }},
    { $limit: 1 },
    { $lookup: {
        from    : "reactions",
        let     : { dbType: "$dbType", dbID: "$dbID" },
        pipeline: [
          { $match: {
              $expr: {
                $and: [
                  { $eq: ["$dbType", "$$dbType"] },
                  { $eq: ["$dbID", "$$dbID"] }
                ]
              }
            }
          },
          { $group: {
            _id: { dbType: "$dbType", dbID: "$dbID" },
              ...CommonQuery.groupReactions,
            }
          }
        ],
        as: "reactions"
      }
    },
  ];
  if (userID) {
    aggregate.push(
      { $lookup: {
          from    : "reactions",
          let     : { dbType: "$dbType", dbID: "$dbID", userID: userID },
          pipeline: [
            { $match: {
                $expr: {
                  $and: [
                    { $eq: ["$dbType", "$$dbType"] },
                    { $eq: ["$dbID", "$$dbID"] },
                    { $eq: ["$userID", "$$userID"] }
                  ]
                }
              }
            },
            { $group: {
                _id: { dbType: "$dbType", dbID: "$dbID", userID: "$userID" },
                ...CommonQuery.groupReactions,
              }
            }
          ],
          as: "myReactions"
        }
      });
  }
  return aggregate;
}