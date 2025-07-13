import mongoose from 'mongoose'

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  specialization: [
    {
      type: String,
      required: true
    }
  ]
},{timestamp: true})

export const hospital = mongoose.model("hospital",hospitalSchema)