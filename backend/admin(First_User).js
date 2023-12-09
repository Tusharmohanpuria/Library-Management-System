import mongoose from "mongoose";
import User from './src/models/User.js';
import bcrypt from "bcrypt";

const mongoURI = "mongodb://127.0.0.1:27017/library";

async function connectToMongoDB() {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MONGODB CONNECTED");
  } catch (err) {
    console.error("MONGODB CONNECTION ERROR:", err);
  }
}

async function createAndSaveUser() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const newUser = new User({
      userType: "admin",
      userFullName: "Admin",
      admissionId: "00000000",
      employeeId: "00000000",
      mobileNumber: 1234567890,
      email: "admin@example.com",
      password: hashedPassword,
      activeTransactions: [],
      prevTransactions: [],
      isAdmin: true
    });

    const savedUser = await newUser.save();
    console.log("Admin user saved successfully:", savedUser);
  } catch (error) {
    console.error("Error saving admin user:", error);
    throw error;
  }
}

async function closeMongoDBConnection() {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
}

async function main() {
  try {
    await connectToMongoDB();
    await createAndSaveUser();
  } catch (error) {
    console.error("An unexpected error occurred:", error);
  } finally {
    await closeMongoDBConnection();
  }
}

main();
