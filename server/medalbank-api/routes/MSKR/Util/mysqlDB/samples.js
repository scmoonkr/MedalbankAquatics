var mysqlCFG    = require('../Config/mysqlCFG');
var MysqlDB     = require('./MysqlDB');

const mysqldb = new MysqlDB("node");

// const context = {
//   query: "",	// where
//   value: "",
//   projection: { cid:1, isbn:1, title:1 },
//   sort: {},
//   skip: 0,
//   limit: BLOCK_SIZE,
// }

const BLOCK_SIZE = 2000;
// const cid = 1234;
// let sql = `insert
//               ${cid}
//               into `
// console.log(sql);              
main();

async function main() {
  await sleep(100);


  console.log("mySQL samples...");

  let stop = 0;

  const body = {
    type          : "titl",
    data          : "%심리학",
    projection    : { cid:1, title:1, isbn:1 },
    sort          : { pubDate:-1 },
    itemsPerPage  : 30,
    page          : 1,
  }

  const holdings = [
    {
      "libraryCode" : "10001",
      "cid" : 1182034,
      "registNo" : "1000000666",
      "isbn" : "9788963294889"
      },
      {
          "libraryCode" : "10001",
          "cid" : 1182033,
          "registNo" : "1000000665",
          "isbn" : "9788963294872"
      },
      {
          "libraryCode" : "10001",
          "cid" : 1182028,
          "registNo" : "1000000664",
          "isbn" : "9788963294865"
      },
      {
          "libraryCode" : "10001",
          "cid" : 1182035,
          "registNo" : "1000000667",
          "isbn" : "9788963294896"
      },
      {
          "libraryCode" : "10001",
          "cid" : 1182036,
          "registNo" : "1000000668",
          "isbn" : "9788963294902"
      },
      {
          "libraryCode" : "10001",
          "cid" : 1182039,
          "registNo" : "1000000670",
          "isbn" : "9788963294926"
      }
  ]
  const contents = [
    {
      "cid" : 1182028,
      "isbn" : "9788963294865",
      "title" : "팔랑팔랑 날개가 예쁜 나비",
      "author" : "유영진 지음",
      "publisher" : "한국톨스토이"
    },
    {
      "cid" : 1182033,
      "isbn" : "9788963294872",
      "title" : "윙윙 하늘을 나는 잠자리",
      "author" : "고수산나 지음",
      "publisher" : "한국톨스토이"
    },
    {
      "cid" : 1182034,
      "isbn" : "9788963294889",
      "title" : "붕붕 꿀을 좋아하는 꿀벌",
      "author" : "고수산나 지음",
      "publisher" : "한국톨스토이"
    },
    {
      "cid" : 1182035,
      "isbn" : "9788963294896",
      "title" : "영차 영차 부지런한 개미",
      "author" : "양미진 지음",
      "publisher" : "한국톨스토이"
    },
    {
      "cid" : 1182036,
      "isbn" : "9788963294902",
      "title" : "겁주기 대장 사마귀",
      "author" : "박양희 지음",
      "publisher" : "한국톨스토이"
    },
    {
      "cid" : 1182039,
      "isbn" : "9788963294926",
      "title" : "폴짝폴짝 메뚜기",
      "author" : "양미진 지음",
      "publisher" : "한국톨스토이"
    }
  ]

  let result;
  let mysql;

  console.log("start transaction...");
  const connection = await mysqldb.getConnection();
  result = await connection.beginTransaction();
  // result = await mysqldb.delete("contents", query);
  mysql = await mysqldb.insertManySQL("contents", contents);
  result = await connection.query(mysql.sql, [mysql.val]);

  connection.commit();
  // connection.rollback();
  connection.release();
  console.log("end transaction...");

  //----------> modifyOne
  // const query = "cid = 1182028"; // "postID = 1";
  // const content = {
  //   "cid" : 1182028,
  //   "isbn" : "9788963294865--",
  //   "author" : "유영진 지음--",
  //   "publisher" : "한국톨스토이--"
  // }
  // result = await mysqldb.findOneAndUpdate("contents", query, { $set: content });

  //----------> update
  // const query = "cid = 1182028"; // "postID = 1";
  // const content = {
  //   "cid" : 1182028,
  //   "isbn" : "9788963294865",
  //   "author" : "유영진 지음",
  //   "publisher" : "한국톨스토이"
  // }
  // result = await mysqldb.update("contents", query, content);

  //----------> insertMany
  // result = await mysqldb.insertMany("contents", contents);
  // result = await mysqldb.insertMany("holding", holdings);

  //----------> insertOne
  // result = await mysqldb.insertOne("contents", contents[0]);

  //----------> delete
  // const query = "cid = 1182028"; // "postID = 1";
  // result = await mysqldb.delete("contents", query);

  //----------> distinct
  // const query = ""; // "postID = 1";
  // const field = "t";
  // result = await mysqldb.distinct(mysqlCFG.tableMSK.indexes, field, query);

  //----------> max
  // const query = ""; // "postID = 1";
  // const field = "postID";
  // result = await mysqldb.max(mysqlCFG.tableMSK.posts, field, query);

  //----------> count
  // const query = "postID = 1";
  // result = await mysqldb.count(mysqlCFG.tableMSK.comments, query);

  //----------> findOne
  // const query = "commentID = 2";
  // const projection = { commentID:1, postID:1, content:1, };
  // result = await mysqldb.findOne(mysqlCFG.tableMSK.comments, query, projection);

  //----------> find
  // const context = {
  //   query     : "postID = 1",
  //   projection: { commentID:1, postID:1, content:1, },
  //   skip      : 1,
  //   limit     : 2,
  //   sort      : { postID:-1, commentID: -1 },
  // }
  // result = await mysqldb.find(mysqlCFG.tableMSK.comments, context);



  console.log("result=", result);

}

async function sleep(ms=500) {
  return new Promise(resolve => {
      setTimeout(resolve, ms)
  });
}
