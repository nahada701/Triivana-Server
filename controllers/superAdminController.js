const superadmins = require("../models/superadminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.superAdminLoginController = async (req, res) => {
  console.log("Inside Super Admin login controller");

  
  const { email, password } = req.body;

  try {
    // Check if the super admin exists
    const existingSuperAdmin = await superadmins.findOne({ email });

    if (!existingSuperAdmin) {
      return res.status(404).json("Super Admin not found");
    }

    // Compare entered password with the hashed password stored in DB
    const isMatch = await bcrypt.compare(password, existingSuperAdmin.password);

    if (!isMatch) {
      return res.status(400).json("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
      { superAdminId: existingSuperAdmin._id },
      process.env.JWT_PASSWORD,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json(err);
  }
};
