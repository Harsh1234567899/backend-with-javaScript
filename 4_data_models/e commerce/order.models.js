import mongoose, { Types } from "mongoose"

const orderItems = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product"
  },
  quantity: {
    type: Number,
    required: true
  }
})

const order = new mongoose.Schema({
  orderPrice: {
    type: Number,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  orderItems: {
    type: [orderItems],
    required: true
  },
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING","CANCELLED","DELIVERD"],// enumeration means choices
    defualt: "PENDING"
  }
},{timestamps: true})

export const order = mongoose.Types("order",order)