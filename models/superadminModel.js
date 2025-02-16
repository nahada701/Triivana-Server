const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Hashed password
});

const superadmins = mongoose.model("superadmins", superAdminSchema);
module.exports = superadmins;
