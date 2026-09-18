const router = require("express").Router();
const Controller = require('../Controllers/socialMedias.controller');

router.post("/view",          Controller.view);
router.post("/viewList",      Controller.viewList);

router.post("/",              Controller.list);

router.get("/:commentID",     Controller.detail);

router.put("/",               Controller.insert);

router.patch("/",             Controller.update);

router.delete("/update/:commentID",  Controller.updateDelete);

router.delete("/:commentID",  Controller.delete);

router.post("/create",        Controller.create);


module.exports = router;


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
