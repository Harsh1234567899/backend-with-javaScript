import mongoose from 'mongoose'



const doctor = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  qualifications: {
    type: String,
    required: true
  },
  experince: {
    type: String,
    required: true,
    default: 0
  },
  workInHospital: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "hospital"
    }
  ]
},{timestamp: true})

export const doctor = mongoose.model("doctor",doctor)