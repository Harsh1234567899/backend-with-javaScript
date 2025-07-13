import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
    defualt: 0,
  },
  stock: {
    type: Number,
    default: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    defualt: unknown
  }
},{timestamps: true})

export const product = mongoose.model('product',productSchema)