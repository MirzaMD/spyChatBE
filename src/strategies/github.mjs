import passport from "passport";
import { Strategy } from "passport-github";
import users from "../model/users.mjs";
import dotenv from "dotenv";
dotenv.config();
passport.serializeUser((user,done)=>{
    done(null, user._id);
})

passport.deserializeUser(async (id, done)=>{
    try{
        const user= await users.findById(id);
        if(!user)
            done(null, false);
        done(null,user)
    }catch(err){
        done(err,null);
    }
})

export default passport.use(new Strategy({
    clientID:process.env.GITHUB_CLIENT_ID,
    clientSecret:process.env.GITHUB_CLIENT_SECRET,
    scope:["identify","guilds","email"],
    callbackURL:"https://spy-chat.vercel.app/auth/github/callback"
}, async (accessToken, refreshToken, profile, done)=>{
    try{
        const user= await users.findOne({githubId:profile.id})
        if(!user){
            try{
                const newUser= await users.create({
                    username:profile.username,
                    githubId:profile.id,
                    authType:"github"
                })
                const saved= await newUser.save();
                return done(null,saved);
            }
            catch(err){
                return done(err,null)
            }
        }
        return done(null,user);
    }catch(err){
        return done(err,null);
    }
}))