const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// 投稿を作成する
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 投稿を更新する
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿の更新に成功しました");
    } else {
      return res.status(403).json("他の人の投稿は更新できません");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 投稿を削除する
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      return res.status(200).json("投稿の削除に成功しました");
    } else {
      return res.status(403).json("他の人の投稿は削除できません");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 特定の投稿を取得する
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// 投稿にいいねする
router.put("/:id/like", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      // まだいいねしていない場合
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({
          $push: {
            likes: req.body.userId,
          },
        });
        res.status(200).json("投稿にいいねを押しました");
      //　すでにいいね済みの場合 
      } else {
        // いいねしたユーザーを取り除く（いいね解除）
        await post.updateOne({
          $pull: {
            likes: req.body.userId,
          },
        });
        res.status(403).json("いいねを外しました");
      }
    } catch (err) {
    res.status(500).json(err);
    }
});

// タイムライン投稿を取得（プロフィール画面用:自分の投稿のみ表示）
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    return res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
})

// タイムライン投稿を取得
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    // フォロワーの投稿を全て取得する
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    return res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
})

module.exports = router;
