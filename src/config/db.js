const mongoose = require("mongoose");


const connectDB = async () => {
    const mongoUri = "mongodb+srv://renancavalcanti_db_user:aukO8kTGQc7cGkUy@cluster0.tuzzeep.mongodb.net/?appName=Cluster0/gg-hiver";

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully!");
};

module.exports = { connectDB }