const User = require("../models/User"); // Giả sử bạn có mô hình User trong MongoDB

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    // Trả về thông tin người dùng khi đăng nhập thành công
    return res.status(200).json({
      success: true,
      username: user.username,
      message: "Login successful",
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
