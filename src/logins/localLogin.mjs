import { Router } from "express";
import "../strategies/local.mjs";
import passport from "passport";
const localLogin = Router();
const ensureAuthentication=(req,res,next)=>{
    if(req.isAuthenticated()) return next();
    return res.status(401).json({message:"inavlid credentials"});
}

localLogin.post("/api/localLogin", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // info.message contains your custom error message
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.sendStatus(200);
    });
  })(req, res, next);
});


localLogin.get("/localSucces",ensureAuthentication,(req,res)=>{
    return res.status(200).json(req.user);
})
localLogin.get("/localFailure",(_,res)=>{
    return res.status(401).json({message:"invalid credentials"})
})
localLogin.post("/local/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err) return next(err);
        req.session.destroy((err)=>{
            if(err) return res.sendStatus(400);
            res.clearCookie("connect.sid",{ path: "/" })
            return res.sendStatus(200);
        })
    })
})
localLogin.get("/api/currentUser",(req,res)=>{
    return req.user?res.status(200).json(req.user):res.status(400).json({message:"no user is logged in."})
})

export default localLogin;