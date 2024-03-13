const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Signup POST controller
exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const phone = req.body.phone;
  const role = req.body.role;

  // Res trả về lỗi 422 nếu validate fail
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.statusMessage = errors.array()[0].msg;
    return res.sendStatus(422);
  }

  // Hash password để tăng độ bảo mật
  bcrypt.hash(password, 12).then((hashedPassword) => {
    const user = new User({
      email: email,
      password: hashedPassword,
      username: username,
      phone: phone,
      role: role,
    });

    // Save collection vào database
    user
      .save()
      .then((result) => {
        res.status(201).json({ message: "Sign up success", user: result });
      })
      .catch((err) => {
        const error = new Error(err);
        return next(error);
      });
  });
};

// Login POST controller
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  // Res trả về lỗi 422 nếu validate fail
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.statusMessage = errors.array()[0].msg;
    return res.sendStatus(422);
  }

  User.findOne({ email: email })
    .then((foundUser) => {
      bcrypt.compare(password, foundUser.password).then((result) => {
        res.status(200).json({
          message: "Login success",
          user: foundUser,
        });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

// Find user controller
exports.findUser = (req, res, next) => {
  const keyword = req.params.keyword;

  User.find({ email: { $regex: keyword, $options: "i" } })
    .then((result) => {
      res.status(201).json({ message: "Found user(s)", user: result });
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};

exports.assignRole = (req, res, next) => {
  const assignedRole = req.body.assignedRole;
  const assignedId = req.body.assignedId;

  User.findById(assignedId)
    .then((result) => {
      // Nếu role được chỉ định là admin sẵn thì không thể đổi role (admin không thể đổi role của admin khác)
      if (result.role === "admin") {
        res.statusMessage = "Can't assign an admin, need more authorize";
        return res.sendStatus(401);
      } else {
        result.role = assignedRole;
        return result.save().then((result) => {
          res.status(200).json({ message: "Assign role success" });
        });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      return next(error);
    });
};
