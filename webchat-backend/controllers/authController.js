const User = require("../models/User");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ success: false, message: "Sai ten dang nhap" });
    }

    if (user.password !== password) {
      return res.status(400).json({ success: false, message: "Sai pass" });
    }

    return res.status(200).json({
      success: true,
      username: user.username,
      message: "dang nhap thanh cong",
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
