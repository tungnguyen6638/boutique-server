const express = require("express");
const { isAdmin } = require("../middleware/is-auth");
const { check } = require("express-validator");
const adminController = require("../controllers/admin");

const router = express.Router();

router.post(
  "/add-product",
  [
    check("productName", "Product name must not be empty")
      .not()
      .isEmpty()
      .trim(),
    check("price", "Price must be a float number and not be empty")
      .not()
      .isEmpty()
      .isFloat()
      .trim(),
    check("long_desc", "Long description must not be empty and length > 5")
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .trim(),
    check("short_desc", "Short description must not be empty and length > 5")
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .trim(),
  ],
  isAdmin,
  adminController.addProduct
);

router.put(
  "/edit-product/:productId",
  [
    check("productName", "Product name must not be empty")
      .not()
      .isEmpty()
      .trim(),
    check("price", "Price must be a float number and not be empty")
      .not()
      .isEmpty()
      .isFloat()
      .trim(),
    check("long_desc", "Long description must not be empty and length > 5")
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .trim(),
    check("short_desc", "Short description must not be empty and length > 5")
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .trim(),
  ],
  isAdmin,
  adminController.editProduct
);

router.delete(
  "/delete-product/:productId",
  isAdmin,
  adminController.deleteProduct
);

router.put("/update-amount/:productId", isAdmin, adminController.updateAmount);

module.exports = router;
