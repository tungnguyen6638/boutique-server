const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  cartItems: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  dateOrder: {
    type: Date,
    required: true,
  },
  buyerName: {
    type: String,
    require: true,
  },
  buyerEmail: {
    type: String,
    require: true,
  },
  buyerPhone: {
    type: String,
    require: true,
  },
  buyerAddress: {
    type: String,
    require: true,
  },
  deliveryStatus: {
    type: String,
    required: true,
  },
  payStatus: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
