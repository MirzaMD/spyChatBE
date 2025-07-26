import "../strategies/discord.mjs";
import { Router } from "express";

import passport from "passport";
const discordLogin= Router();

discordLogin.get("/auth/discord",passport.authenticate("discord"));

discordLogin.get("/auth/discord/callback", passport.authenticate("discord",{
  successRedirect:"https://spy-chat.vercel.app",
  failureRedirect:"/discord/failure"
}));

discordLogin.get("/discord/succes",(req,res)=>{
  return res.status(200).json({user:req.user});
})
discordLogin.get("/discord/failure",(_,res)=>{
  return res.sendStatus(400);
})

discordLogin.post("/api/discord/logout",(req,res,next)=>{
  req.logOut((err)=>{
    if(err) return next(err)
      req.session.destroy((err)=>{
    if(err) return res.sendStatus(400);
    res.clearCookie("connect.sid");
    return res.sendStatus(200)
    })
  })
})


export default discordLogin;