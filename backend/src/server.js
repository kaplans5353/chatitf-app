//const express = require('express');
import express from "express";
import dotenv from "dotenv";
import autRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path from "path";
dotenv.config();

const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", autRoutes)
app.use("/api/messages", messageRoutes)

if (process.env.NODE_ENV == "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
}

app.get("*",(_, res) => {
    res.sendFile(path.join(__dirname, "../frontend","dist","index.html"));
})






app.listen(PORT, () => console.log("Server running on port :" + PORT));
