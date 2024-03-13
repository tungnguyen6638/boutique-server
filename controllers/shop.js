// Thư viện
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const io = require("../socket");
// ObjectId
const ObjectId = mongoose.Types.ObjectId;
// Models
const Product = require("../models/Product");
const Order = require("../models/Order");

// Config nodemailer
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY,
    },
  })
);

// GET all products controller
exports.getAllProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res
        .status(200)
        .json({ message: "Get products success", products: products });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

// GET 1 product by ID controller
exports.getProductById = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res
        .status(200)
        .json({ message: "Get product success", product: product });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

// POST order
exports.postOrder = (req, res, next) => {
  const buyerEmail = req.body.buyerEmail;
  const buyerName = req.body.buyerName;
  const buyerPhone = req.body.buyerPhone;
  const buyerAddress = req.body.buyerAddress;
  const cartItems = req.body.cart
    ? req.body.cart.map((item) => {
        return {
          productId: new ObjectId(item.product._id),
          quantity: item.quantity,
        };
      })
    : [];
  const total = req.body.total;

  const html = `<main>
  <div>
    <h1>Hello ${buyerName}</h1>
    <h2>Thank you for buying at Boutique</h2>
    <p>Here are your order informations : </p>
    <p>Phone number : ${buyerPhone} <p>
    <p>Address : ${buyerAddress}</p>
    <table>
      <thead>
        <tr>
          <th>Product name</th>
          <th>Image</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Sub total</th>
        </tr>
      </thead>
      <tbody>
        ${req.body.cart.map((element) => {
          return ` <tr>
          <td>${element.product.name}</td>
          <td><img src=${`${process.env.SERVER_DOMAIN}/images/${element.product.images[0]}`}/></td>
          <td>${element.product.price}</td>
          <td>${element.quantity}</td>
          <td>${element.quantity * element.product.price}</td>
          </tr>`;
        })}
      </tbody>
    </table>
    <p>Total : ${total}</p>
  </div>
</main>`;

  // Kiểm tra validate
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.statusMessage = errors.array()[0].msg;
    return res.sendStatus(422);
  }

  // Trả về nếu khách hàng không đặt
  if (cartItems.length === 0) {
    res.statusMessage = "Cart is empty, can't process your order";
    return res.sendStatus(451);
  }

  Product.find().then((products) => {
    // Validate amount ở store có đáp ứng được khách hàng không
    products.forEach((product) => {
      cartItems.forEach((item) => {
        if (item.productId === product._id) {
          if (Number(item.quantity) > Number(product.amount)) {
            res.statusMessage = `Product ${product.name} amount is not meet the need `;
            return res.sendStatus(451);
          }
        }
      });
    });

    // Nếu amount đủ đáp ứng thì tạo order cho khách
    const newOrder = new Order({
      user: req.user._id,
      cartItems: cartItems,
      total: total,
      dateOrder: Date.now(),
      buyerName: buyerName,
      buyerEmail: buyerEmail,
      buyerPhone: buyerPhone,
      buyerAddress: buyerAddress,
      deliveryStatus: "Waiting for progressing",
      payStatus: "Waiting for pay",
    });

    newOrder
      .save()
      .then((result) => {
        // Update lại amount
        cartItems.forEach((item) => {
          Product.findOne({ _id: item.productId }).then((result) => {
            result.amount = Number(result.amount) - Number(item.quantity);
            result.save();
          });
        });

        // set socketio và gửi res cho client
        io.getIO().emit("order", {
          action: "add",
          order: result,
        });
        res
          .status(200)
          .json({ message: "Order success, thank you for buying at Boutique" });
        transporter.sendMail({
          to: buyerEmail,
          from: process.env.SENDGRID_EMAIL,
          subject: "Buy order at Botique",
          html: html,
        });
        res.end();
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
  });
};

// GET orders of user
exports.findOrdersOfUser = (req, res, next) => {
  Order.find({ user: req.user._id })
    .sort({ date: -1 })
    .then((result) => {
      res.status(200).json({ message: "Get orders success", orders: result });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

// GET order by id
exports.getOrderById = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .populate("user")
    .populate("cartItems.productId")
    .then((result) => {
      res.status(200).json({ message: "Get order success", order: result });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

// GET all orders
exports.getOrders = (req, res, next) => {
  Order.find()
    .populate("user")
    .populate("cartItems.productId")
    .sort({ date: -1 })
    .then((result) => {
      res.status(200).json({ message: "Find orders success", orders: result });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};
