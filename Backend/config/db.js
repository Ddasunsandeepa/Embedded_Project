const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://dasun_user:YfYytHbQ5WwE4INL@embedded-backend.kwldk3p.mongodb.net/embeddedDB?retryWrites=true&w=majority&appName=Embedded-backend",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ MongoDB connected...");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
