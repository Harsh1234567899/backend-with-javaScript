import mongoose from ' mongoose'
import { Timestamp } from 'bson'

const category = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
},{timestamp: true})

export const category = mongoose.model('category',category)