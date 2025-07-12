import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema({
  constentt: {
    type: String,
    required: true,
  },
  complete: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, // giveing reference of other model
    ref: "User"
  },
  subTodos: [ // sub todo passing in array  using reference
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subtodo"
    }
  ]
},{timestamps: true})

export const todo = mongoose.model("todo",todoSchema)