import mongoose from 'mongoose'

const recordSchema = new mongoose.Schema({},{timestamp: true})

export const record = mongoose.model("record",recordSchema)