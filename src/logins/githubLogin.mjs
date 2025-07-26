import { Router } from "express";
import "../strategies/github.mjs";
import passport from "passport";

const githubLogin= Router();

githubLogin.get("/auth/github",passport.authenticate("github",{
    scope: ["user:email"],
    prompt: "consent" }
));

githubLogin.get("/auth/github/callback",passport.authenticate("github",{
    successRedirect:"https://spy-chat.vercel.app/land",
    failureRedirect:"/gitFailure"
}));


githubLogin.get("/gitFailure",(_,res)=>{
    return res.status(401).json({error:"Login failed."});
})

githubLogin.post("/api/github/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err) next(err);
        req.session.destroy((err)=>{
             if(err) return res.sendStatus(400);
             res.clearCookie("connect.sid");
             return res.sendStatus(200);
        })
    })
})

export default githubLogin;