const User = require("../models/User");
const router = require("express").Router();

// ユーザ情報の更新
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("ユーザー情報が更新されました");

    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("あなたは自分のアカウントの時だけ情報を更新できます");
  }
});

// ユーザ情報の削除
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("ユーザー情報が削除されました");

    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    return res.status(403).json("あなたは自分のアカウントの時だけ情報を削除できます");
  }
});

// // ユーザ情報の取得
// router.get("/:id", async (req, res) => {
//   try {
//     // mongooseのメソッドでidが一致するユーザー情報取得
//     const user = await User.findById(req.params.id);
//     // パスワード等の隠したいパラメータを分割代入しておく
//     const { password, updatedAt, ...other } = user._doc;
//     // otherのみ表示
//     return res.status(200).json(other);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// });

// クエリでユーザ情報の取得
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    // mongooseのメソッドでidが一致するユーザー情報取得
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username }); 
    // パスワード等の隠したいパラメータを分割代入しておく
    const { password, updatedAt, ...other } = user._doc;
    // otherのみ表示
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// ユーザーのフォロー
router.put("/:id/follow", async (req, res) => {
  // 自分自身はフォローできない
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      // フォロワーに自分がいなかったらフォローできる(すでにフォロー済みでないか)
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $push: {
            followers: req.body.userId,
          },
        });
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          },
        });
        res.status(200).json("フォローに成功しました");
      } else {
        res.status(403).json("あなたはすでにこのユーザーをフォローしています");
      }
    } catch (err) {
    res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分はフォローできません");
  }
});

// ユーザーのフォローを外す
router.put("/:id/unfollow", async (req, res) => {
  // 自分自身はフォローできないので、フォロー解除もできない
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      // フォロワーに存在したら、フォローを外せる
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({
          $pull: {
            followers: req.body.userId,
          },
        });
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          },
        });
        res.status(200).json("フォローを解除しました");
      } else {
        res.status(403).json("このユーザーはフォロー解除できません");
      }
    } catch (err) {
    res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分はフォロー解除できません");
  }
});


module.exports = router;