const express = require("express");
const router = express.Router();
const multer = require("multer");
const { uploadImage } = require("../controllers/messageController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;
