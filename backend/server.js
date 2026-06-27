import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

dotenv.config();

//Connect DB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

//test
app.get("/", (req, res) => {
    res.send("MathMentor AI Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})