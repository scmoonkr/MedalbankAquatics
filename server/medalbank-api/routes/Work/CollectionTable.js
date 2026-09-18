const mongoCFG 		= require('../Config/mongoCFG');

/*
 *	create collections
 */
exports.CreateCollection = {
  athletes: {
    collection: mongoCFG.Medalbank.athletes,
    indexes: [
      { query: { athleteID:1 }, name: "athleteID", option: { unique: true }  },
      { query: { name:1 }, name: "name",  },
      { query: { team:1 }, name: "team",  },
      { query: { "index":1, "index":1 }, name: "index",  },
    ]
  },
  
  authorities: {
    collection: mongoCFG.Medalbank.authorities,
    indexes: [
			{ query: { poolID:1 }, name: "poolID", option: { unique: true }  },
			{ query: { nameTemp:1, }, name: "nameTemp",  },
			{ query: { indexes:1, }, name: "indexes",  },
			{ query: { province:1, }, name: "province",  },
		]
  },
  
  competitions: {
    collection: mongoCFG.Medalbank.competitions,
    indexes: [
      { query: { competitionID:1 }, name: "competitionID", option: { unique: true }  },
      { query: { competitionName:1 }, name: "competitionName",  },
      { query: { datetime:1 }, name: "datetime",  },
      { query: { indexes:1 }, name: "indexes",  },    
    ],
  },
  
  communities: {
    collection: mongoCFG.Medalbank.communities,
    indexes: [
			{ query: { communityID:1 }, name: "communityID", option: { unique: true }  },
			{ query: { userNo:1, }, name: "userNo",  },
		]
  },
  
  history: {
    collection: mongoCFG.Medalbank.history,
    indexes: [
      { query: { datetime:1 }, name: "datetime",  },
		]
  },
  
  pools: {
    collection: mongoCFG.Medalbank.pools,
    indexes: [
			{ query: { poolID:1 }, name: "poolID", option: { unique: true }  },
			{ query: { nameTemp:1, }, name: "nameTemp",  },
			{ query: { indexes:1, }, name: "indexes",  },
			{ query: { province:1, }, name: "province",  },
		]
  },
  
  rankings: {
    collection: mongoCFG.Medalbank.leaderboard,
    indexes: [
			{ query: { timeID:1 }, name: "timeID", option: { unique: true }, },
			{ query: { athleteID:1 }, name: "athleteID", },
			{ query: { index:1 }, name: "index", },
		]
  },
  
  reactions: {
    collection: mongoCFG.Medalbank.reactions,
    indexes: [
			{ query: { dbType:1, dbID:1, userID:1 }, name: "dbUserID", option: { unique: true }, },
			{ query: { userID:1 }, name: "userID", },
		]
  },
  
  records: {
    collection: mongoCFG.Medalbank.records,
    indexes: [
      { query: { recordID:1 }, name: "recordID", option: { unique: true }  },
      { query: { recordName:1 }, name: "name",  },
		]
  },
  
  replies: {
    collection: mongoCFG.Medalbank.replies,
    indexes: [
			{ query: { replyID:1 }, name: "replyID", option: { unique: true }  },
			{ query: { communityID:1 }, name: "communityID",},
			{ query: { userNo:1, }, name: "userNo",  },
		]
  },
  
  reports: {
    collection: mongoCFG.Medalbank.reports,
    indexes: [
			// { query: { datetime:1 }, name: "datetime", option: { unique: true }  },
			{ query: { datetime:1, type:1, }, name: "datetime",},
			{ query: { userID:1, }, name: "userID",  },
		]
  },
  
  tags: {
    collection: mongoCFG.Medalbank.tags,
    indexes: [
			{ query: { tagID:1 }, name: "tagID", option: { unique: true }  },
			{ query: { tag:1, }, name: "tag",  },
		]
  },
  
  teams: {
    collection: mongoCFG.Medalbank.teams,
    indexes: [
      { query: { teamID:1 }, name: "teamID", option: { unique: true }  },
      { query: { name:1 }, name: "name",  },
      { query: { datetime:1 }, name: "datetime",  },
      { query: { indexes:1 }, name: "indexes",  },
		]
  },
  
  times: {
    collection: mongoCFG.Medalbank.times,
    indexes: [
      { query: { timeID:1 }, name: "timeID", option: { unique: true }  },
      { query: { heatCode:1 }, name: "heatCode", },
      { query: { name:1 }, name: "name", },
      { query: { team:1 }, name: "team", },
      { query: { time:1 }, name: "time", },
      { query: { athleteID:1 }, name: "athleteID",  },
      { query: { userNo:1 }, name: "userNo",  },
      { query: { "indexes.index":1, "indexes.type":1 }, name: "index",  },
		]
  },
  
  users: {
    collection: mongoCFG.Medalbank.users,
    indexes: [
			{ query: { userNo:1 }, name: "userNo", option: { unique: true }  },
			{ query: { name:1, }, name: "name",  },
			{ query: { indexes:1, }, name: "indexes",  },
			{ query: { province:1, }, name: "province",  },
		]
  },
  
  questions: {
    collection: mongoCFG.Medalbank.questions,
    indexes: [
			{ query: { questionID:1 }, name: "questionID", option: { unique: true }  },
			{ query: { category:1, }, name: "category",  },
			{ query: { question:1, }, name: "question",  },
		]
  },
  
  questionUsers: {
    collection: mongoCFG.Medalbank.questionUsers,
    indexes: [
			{ query: { questionUserID:1 }, name: "questionUserID", option: { unique: true }  },
			{ query: { questionID:1 }, name: "questionID", },
			{ query: { userID:1, }, name: "userID",  },
			{ query: { category:1, }, name: "category",  },
		]
  },
  
  activities: {
    collection: mongoCFG.Medalbank.activities,
    indexes: [
			{ query: { activityID:1 }, name: "activityID", option: { unique: true }  },
			{ query: { userID:1, }, name: "userID",  },
			{ query: { poolID:1, }, name: "poolID",  },
			{ query: { started:1, }, name: "started",  },
		]
  },
}
