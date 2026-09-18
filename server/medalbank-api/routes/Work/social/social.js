const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const url = 'mongodb://localhost:27017';
const dbName = 'socialMedia';
let db;

MongoClient.connect(url, (err, client) => {
  if (err) throw err;
  console.log("Connected successfully to MongoDB server");
  db = client.db(dbName);
});

// 게시물 생성
app.post('/posts', async (req, res) => {
  const postsCollection = db.collection('posts');
  try {
    const result = await postsCollection.insertOne(req.body);
    res.status(201).json(result.ops[0]);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 게시물 목록 조회
app.get('/posts', async (req, res) => {
  const postsCollection = db.collection('posts');
  try {
    const posts = await postsCollection.find({}).toArray();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 특정 게시물의 댓글 생성
app.post('/posts/:postId/comments', async (req, res) => {
  const commentsCollection = db.collection('comments');
  const comment = { ...req.body, postId: req.params.postId };
  try {
    const result = await commentsCollection.insertOne(comment);
    res.status(201).json(result.ops[0]);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 특정 게시물의 댓글 목록 조회
app.get('/posts/:postId/comments', async (req, res) => {
  const commentsCollection = db.collection('comments');
  try {
    const comments = await commentsCollection.find({ postId: req.params.postId }).toArray();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 특정 댓글의 대댓글 생성
app.post('/comments/:commentId/replies', async (req, res) => {
  const repliesCollection = db.collection('replies');
  const reply = { ...req.body, commentId: req.params.commentId };
  try {
    const result = await repliesCollection.insertOne(reply);
    res.status(201).json(result.ops[0]);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 특정 댓글의 대댓글 목록 조회
app.get('/comments/:commentId/replies', async (req, res) => {
  const repliesCollection = db.collection('replies');
  try {
    const replies = await repliesCollection.find({ commentId: req.params.commentId }).toArray();
    res.json(replies);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// 서버 실행
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


const comment = [
  {
    commentID:1,
    title: "comment 1",
    category: "category1",
    reactions: { like: 5, dislike: 3, rating: 3.9 },
    myReactions: { like:1, rating: 3.5 },
    replies: [
      {
        title: "reply 1",
        reactions: { like: 5, dislike: 3, rating: 3.9 },
        myReactions: { like:1, rating: 3.5 },        
        replies: [
          {
            title: "reply 1-reply 1",
            reactions: { like: 5, dislike: 3, rating: 3.9 },
            myReactions: { like:1, rating: 3.5 },
          },
          {
            title: "reply 1-reply 2",
            reactions: { like: 5, dislike: 3, rating: 3.9 },
            myReactions: { like:1, rating: 3.5 },
          }
        ]
      },
      
      {
        title: "reply 2",
        reactions: { like: 5, dislike: 3, rating: 3.9 },
        myReactions: { like:1, rating: 3.5 },        
        replies: [
          {
            title: "reply 2-reply 1",
            reactions: { like: 5, dislike: 3, rating: 3.9 },
            myReactions: { like:1, rating: 3.5 },
          },
          {
            title: "reply 2-reply 2",
            reactions: { like: 5, dislike: 3, rating: 3.9 },
            myReactions: { like:1, rating: 3.5 },
          }
        ]
      }
    ]
  }
]

comment 1을 조회하면 위와 같은 결과를 원해.
MongoDB collection 구성을 보여줘
comment 1을 얻기 위한  mongodb query를 보여줘

db.comments.aggregate([
  { $match: { commentID: 1 } },
  { $lookup: {
      from: "replies",
      localField: "_id",
      foreignField: "commentId",
      as: "replies"
    }
  },
  { $unwind: "$replies" },
  { $lookup: {
      from: "reactions",
      localField: "replies._id",
      foreignField: "replyId",
      as: "replies.reactions"
    }
  },
  { $group: {
      _id: "$_id",
      title: { $first: "$title" },
      category: { $first: "$category" },
      reactions: { $first: "$reactions" },
      replies: { $push: "$replies" }
    }
  },
  { $lookup: {
      from: "reactions",
      localField: "_id",
      foreignField: "commentId",
      as: "reactions"
    }
  }
]);

{
  "title" : "post 1 - comment 1 - reply 1 - reply 1",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af2517f95cde27d3f58d58")
}

{
  "title" : "post 1 - comment 1 - reply 1 - reply 2",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af2517f95cde27d3f58d58")
}

{
  "title" : "post 1 - comment 1 - reply 1 - reply 3",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af2517f95cde27d3f58d58")
}

{
  "title" : "post 1 - comment 1 - reply 1 - reply 4",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af2517f95cde27d3f58d58")
}

/* 1 */
{
  "title" : "post 1 - comment 1",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a")
}

/* 2 */
{
  "title" : "post 1 - comment 2",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a")
}

/* 3 */
{
  "title" : "post 1 - comment 3",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a")
}

/* 4 */
{
  "title" : "post 1 - comment 4",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a")
}

/* 5 */
{
  "title" : "post 1 - comment 1 - reply 1",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af217ff95cde27d3f58c6a")
}

/* 6 */
{
  "title" : "post 1 - comment 1 - reply 2",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af217ff95cde27d3f58c6a")
}

/* 7 */
{
  "title" : "post 1 - comment 1 - reply 3",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af217ff95cde27d3f58c6a")
}

/* 8 */
{
  "title" : "post 1 - comment 1 - reply 4",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af217ff95cde27d3f58c6a")
}

/* 9 */
{
  "title" : "post 1 - comment 1 - reply 1 - reply 1",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af2517f95cde27d3f58d58")
}

/* 10 */
{
  "title" : "post 1 - comment 1 - reply 1 - reply 2",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af2517f95cde27d3f58d58")
}

/* 11 */
{
  "title" : "post 1 - comment 1 - reply 1 - reply 3",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af2517f95cde27d3f58d58")
}

/* 12 */
{
  "title" : "post 1 - comment 1 - reply 1 - reply 4",
  "postId" : ObjectId("65af217ff95cde27d3f58c6a"),
  "parentId" : ObjectId("65af2517f95cde27d3f58d58")
}