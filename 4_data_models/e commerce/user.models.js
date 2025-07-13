import monggose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unnique : true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unnique : true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
  }
},{timestamps: true})

export const user = monggose.model("user",userSchema)