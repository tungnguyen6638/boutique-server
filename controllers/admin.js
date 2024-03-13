const Product = require("../models/Product");
const io = require("../socket");
const { deleteImageFile } = require("../helper/file.js");
const { validationResult } = require("express-validator");

// Controller POST add product
exports.addProduct = (req, res, next) => {
  const productName = req.body.productName;
  const price = req.body.price;
  const long_desc = req.body.long_desc;
  const short_desc = req.body.short_desc;
  const category = req.body.category;
  const images = req.files.map((img) => {
    return img.filename;
  });

  // Res trả về lỗi 422 nếu validate fail
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.statusMessage = errors.array()[0].msg;
    return res.sendStatus(422);
  }

  const newProduct = new Product({
    name: productName,
    price: price,
    amount: 0,
    long_desc: long_desc,
    short_desc: short_desc,
    category: category,
    images: images,
  });

  newProduct
    .save()
    .then((result) => {
      // Trước khi gửi trả về cho client một res thì tạo socket.io để cập nhật cho tất cả các client
      io.getIO().emit("product", {
        action: "add",
        product: result,
      });
      res
        .status(201)
        .json({ message: "Create new product success", product: result });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

// Controller PUT edit product
exports.editProduct = (req, res, next) => {
  const productId = req.params.productId;
  const updatedProductName = req.body.productName;
  const updatedPrice = req.body.price;
  const updatedLong_desc = req.body.long_desc;
  const updatedShort_desc = req.body.short_desc;
  const updatedCategory = req.body.category;
  const updatedImages = req.files.map((img) => {
    return img.filename;
  });

  // Res trả về lỗi 422 nếu validate fail
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.statusMessage = errors.array()[0].msg;
    return res.sendStatus(422);
  }

  Product.findById(productId)
    .then((result) => {
      result.name = updatedProductName;
      result.price = updatedPrice;
      result.long_desc = updatedLong_desc;
      result.short_desc = updatedShort_desc;
      result.category = updatedCategory;
      if (updatedImages.length !== 0) {
        result.images.forEach((img) => deleteImageFile(img));
        result.images = updatedImages;
      }
      // Trước khi gửi trả về cho client một res thì tạo socket.io để cập nhật cho tất cả các client
      io.getIO().emit("product", {
        action: "edit",
        product: result,
      });
      return result.save().then((result) => {
        res
          .status(201)
          .json({ message: "Edit product success", product: result });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

// Controller DELETE product
exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      // Delete các file hình ảnh được lưu trong server trước
      product.images.forEach((img) => deleteImageFile(img));
      // Xong delete product
      Product.findByIdAndDelete(productId).then((result) => {
        io.getIO().emit("product", {
          action: "delete",
        });
        res.status(200).json({ message: "Delete success" });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};

exports.updateAmount = (req, res, next) => {
  const productId = req.params.productId;
  const amount = req.body.amount;

  Product.findByIdAndUpdate(productId, { amount: amount })
    .then((result) => {
      io.getIO().emit("amount", {
        action: "update",
        product: result,
        amount: amount,
      });
      res.status(200).json({ message: "Amount updated" });
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
};
