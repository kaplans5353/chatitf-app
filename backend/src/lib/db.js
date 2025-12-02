import mongoose from "mongoose";

export const connectDB = async () => {
    try {
       const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB Bağlantısı Başarılı", conn.connection.host)
    } catch (error) {
        console.error("VT BAGLANTI HATASI", error)
        process.exit(1);
    }
}