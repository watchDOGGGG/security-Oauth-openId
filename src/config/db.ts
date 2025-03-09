import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI  || "mongodb://127.0.0.1:27017"

const connectDB = async() =>{
    try{
        await mongoose.connect(MONGO_URI)
        console.log("Db connected")
    }catch(err){
        console.log("error connecting db", err)
        process.exit(1)
    }
}

export const dbconnect =  connectDB()
