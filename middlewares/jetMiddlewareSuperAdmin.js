const jwt = require("jsonwebtoken");

const jwtMiddlewareSuperAdmin = (req, res, next) => {
  console.log("Inside Super Admin JWT middleware");

  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json("Authorization failed: No token provided");
  }

  try {
    const jwtResponse = jwt.verify(token, process.env.JWT_PASSWORD);
    req.superAdminId = jwtResponse.superAdminId; // Attach super admin ID to the request
    next();
  } catch (err) {
    res.status(401).json("Invalid or expired token");
  }
};

module.exports = jwtMiddlewareSuperAdmin;
