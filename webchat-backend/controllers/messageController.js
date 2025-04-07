
exports.uploadImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, imageUrl });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ error: "Lỗi khi upload hình ảnh" });
  }
};

  
