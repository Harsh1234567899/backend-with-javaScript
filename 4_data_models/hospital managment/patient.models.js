import mongoose from 'mongoose'

const patient = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  diagonseWith: {
    type: String,
    required: true
  },
  addres: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['MALE','FEMALE','0'],
    required: true
  },
  admittedIn : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospital"
  }
},{timestamp: true})

export const patient = mongoose.model("patient",patient)