const jwt = require("jsonwebtoken");
const users = require("../models/userModel");

exports.googleAuthController = async (req, res) => {
  try {
    const { name, email, googleId } = req.body;

    let user = await users.findOne({ email });

    if (!user) {
      // Register user if not exists
      user = new users({ name, email, googleId });
      await user.save();
    }

    // Generate JWT token (Without verifying Google token)
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_PASSWORD, {
      expiresIn: "3d",
    });

    res.json({ user, token: jwtToken });
  } catch (error) {
    res.status(500).json({ error: "Google authentication failed" });
  }
};
