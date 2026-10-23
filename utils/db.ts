import mongoose from "mongoose";
import dns from "dns";
require("dotenv").config();

// Node's resolver can pick up 127.0.0.1 on some networks, which breaks the mongodb+srv lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dbUrl: string = process.env.DB_URI || "";

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl, { family: 4 }).then((data: any) => {
      console.log("Database connected");
    });
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
