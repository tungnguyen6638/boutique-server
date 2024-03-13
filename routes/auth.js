const express = require("express");
const { check } = require("express-validator");
const User = require("../models/User");
const { isAdmin } = require("../middleware/is-auth");

const authController = require("../controllers/auth");

const router = express.Router();

router.post(
  "/signup",
  [
    // Validate user
    check("email")
      .not()
      .isEmpty()
      .withMessage("Email must not be empty")
      .isEmail()
      .withMessage("Email is invalid")
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email already exist");
          }
        });
      })
      .trim(),
    check("password", "Password must not be empty and length is greater than 8")
      .not()
      .isEmpty()
      .isLength({ min: 8 })
      .trim(),
    check("username", "Username must not be empty").not().isEmpty().trim(),
    check("phone", "Phone is invalid").not().isEmpty().isNumeric().trim(),
  ],
  authController.postSignUp
);

router.post(
  "/login",
  [
    // Validate user
    check("email", "Email is invalid")
      .not()
      .isEmpty()
      .isEmail()
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("Email doesn't exist");
          }
        });
      })
      .trim(),
    check("password", "Password must not be empty and length is greater than 8")
      .not()
      .isEmpty()
      .isLength({ min: 8 })
      .trim(),
  ],
  authController.postLogin
);

router.post("/find/:keyword", isAdmin, authController.findUser);

router.put("/assign-role", isAdmin, authController.assignRole);

module.exports = router;
