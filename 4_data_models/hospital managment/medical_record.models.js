import mongoose from 'mongoose'

const record = new mongoose.Schema({},{timestamp: true})

export const record = mongoose.model("record",record)