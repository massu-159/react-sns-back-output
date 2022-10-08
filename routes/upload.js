const router = require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
  // 保存先
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  // ファイル名
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage });

// 画像アップロードApi
router.post("/", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("画像アップロードに成功しました")
  } catch (err) {
    return console.log(err);
  }
})

module.exports = router;
