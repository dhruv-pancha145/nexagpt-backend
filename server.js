import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// import OpenAI from 'openai';
// import 'dotenv/config';

// const client = new OpenAI({
//   apiKey: process.env.GROQ_API_KEY,
//   baseURL: 'https://api.groq.com/openai/v1',
// });

// const response = await client.chat.completions.create({
//   model: 'llama-3.3-70b-versatile',
//   messages: [
//     { role: 'user', content: 'Differences between SQL & MongoDB' }
//   ],
// });

// console.log(response.choices[0].message.content);

import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose, { connect } from "mongoose";
import authRoute from "./routes/auth.js";

import chatRoute from "./routes/chat.js";

// import { Messages } from "openai/resources/chat/completions.js";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);


const PORT = process.env.PORT || 8080;



// we test the api end point with use this code
// app.post("/test", async (req, res) => {
  
// });

app.use("/api",chatRoute);
app.use("/api/auth", authRoute); // Auth routes registered
app.use("/api", chatRoute);
















const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected with Database!");
  } catch (err) {
    console.log("failed to connect with DB", err);
  }
};





app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
  connectDB();
});
