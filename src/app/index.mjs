import express from "express";
import dotenv from  "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import userObj from "./users/userObj.mjs";
import "../strategies/local.mjs";
import localLogin from "../logins/localLogin.mjs";
import "../strategies/discord.mjs"
import discordLogin from "../logins/discordLogin.mjs";
import "../strategies/github.mjs";
import githubLogin from "../logins/githubLogin.mjs";
import http from "http";
import { Server } from "socket.io";
import Message from "../model/chatRooms.mjs";
import cors from "cors";
dotenv.config();
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Connected to mongodb atlas"))
.catch((err)=>console.log(err));
const app= express();
app.use(express.json({limit:"100mb"}));
app.use(express.urlencoded({extended:true, limit:"100mb"}));
app.use(cors({
    methods:["GET","POST","PATCH","DELETE","PUT","OPTIONS"],
    origin:["https://spy-chat-appmmhb.vercel.app","http://localhost:3000","http://localhost:3001","http://localhost:3002"],
    credentials:true
}))

app.use(session({
  secret: "some_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    sameSite: "none", // ✅ Important for cross-site cookies
    secure: true       // ✅ Required for SameSite: 'none'
  },
  store: MongoStore.create({
    client: mongoose.connection.getClient()
  })
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(userObj);
app.use(localLogin);
app.use(discordLogin);
app.use(githubLogin);
const PORT= process.env.PORT || 3005;
const httpServer=http.createServer(app);
const io=new Server(httpServer,{
    cors:{
    methods:["GET","POST","PATCH","DELETE","PUT","OPTIONS"],
    origin:["https://spy-chat-appmmhb.vercel.app","http://localhost:3000","http://localhost:3001","http://localhost:3002"],
    credentials:true
    }
})

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("message-sent", async ({ to, msg, senderId }) => {
    try {
      console.log(`Message received from ${senderId} to room ${to}: ${msg}`);

      const savedMessage = await Message.create({
        roomId: to,
        senderId,
        text: msg,
        timestamp: new Date()
      });

      io.to(to).emit("message-received", {
        senderId,
        text: msg,
        timestamp: savedMessage.timestamp
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// GET /api/messages/:roomId
app.get("/api/messages/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to load chat" });
  }
});

app.get("/api/chats",async (_, res)=>{
  try{
    const chats = await Message.find({});
    if(!chats) return res.status(400).json({message:"No chats available"});
    return res.status(200).json(chats)
  }
  catch(err){
    return res.status(400).json(err);
  }
})

httpServer.listen(PORT,()=>{
    console.log(`listening to http://localhost:${PORT}`);
})