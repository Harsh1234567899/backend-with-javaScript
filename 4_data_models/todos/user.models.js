import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
  // user: String,
  // email: String,
  // isActive: Boolean

    user: {
      type: String,
      required: true, // mongodb will identify and give msg this filled required
      unique: true, // mongodb save only unique 
      lowercase: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true,"password is required"], // we can pass array where we can give one true of false and one message if not filed
      
    }
  },
  {
    timestamps: true // creatAT- when create  , updateAt - when update
  }
)

export const User = mongoose.model("User",userSchema)

// when data store in mondodb this User convert and store like "users" lowercase and in last "s" is added