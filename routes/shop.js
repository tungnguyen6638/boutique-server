const express = require("express");
const { check } = require("express-validator");

const { hasUser } = require("../middleware/has-user");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/products", shopController.getAllProducts);

router.get("/detail/:productId", shopController.getProductById);

router.get("/order/:orderId", shopController.getOrderById);

router.get("/orders", shopController.getOrders);

router.post(
  "/order",
  [
    check("buyerName", "Fullname must not be empty").not().isEmpty().trim(),
    check("buyerEmail", "Email is invalid").not().isEmpty().isEmail().trim(),
    check(
      "buyerAddress",
      "Address must not be empty and length is greater than 5"
    )
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .trim(),
    check("buyerPhone", "Phone is invalid").not().isEmpty().isNumeric().trim(),
  ],
  hasUser,
  shopController.postOrder
);

router.post("/user-orders", hasUser, shopController.findOrdersOfUser);

module.exports = router;
