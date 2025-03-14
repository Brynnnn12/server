const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.protect = async (req, res, next) => {
  try {
    let token = req.cookies.jwt || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({
        status: "401",
        message: "Anda belum login, silakan login terlebih dahulu",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findByPk(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: "401",
        message: "User tidak ditemukan",
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "401",
      message: "Token tidak valid",
    });
  }
};


exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "403",
        message: "Anda tidak memiliki izin untuk melakukan aksi ini",
      });
    }
    next();
  };
};
