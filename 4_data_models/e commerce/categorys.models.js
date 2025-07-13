import mongoose from ' mongoose'
import { Timestamp } from 'bson'

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
},{timestamp: true})

export const category = mongoose.model('category',categorySchema)