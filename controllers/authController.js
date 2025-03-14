const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ✅ REGISTER USER
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Username, email, dan password harus diisi!",
      });
    }

    // Cek apakah email sudah digunakan
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email sudah digunakan!",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Simpan user baru
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = signToken(user.id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ✅ LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email dan password harus diisi!",
      });
    }

    // Cek apakah user ada di database
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Email atau password salah!",
      });
    }

    const token = signToken(user.id);

    // Simpan token di cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// ✅ LOGOUT USER
exports.logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    status: "success",
    message: "Logout berhasil!",
  });
};

exports.getUser=async(req,res)=>{
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
}