import passport from "passport";
import { Strategy } from "passport-local";
import users from "../model/users.mjs";
import { unhash } from "../hashing/bcrypting.mjs";
passport.serializeUser((user,done)=>{
    done(null,user._id);
})

passport.deserializeUser(async (id,done)=>{
    try{
        const user = await users.findById(id);
        if(!user)
            return done(null, false, { message:"user not found"})
        done(null,user);
    }
    catch(err){
        done(err,null);
    }
})
export default passport.use( new Strategy(
{usernameField:"username",passwordField:"password"},
async ( username, password, done) =>{
    try{
        const user = await users.findOne({username:username});
        if(!user)
            return done(null, false, { message:"inavlid username"});
        if(!unhash(password,user.password))
            return done(null, false, { message:"invalid password."})
        return done(null, user);
    }catch(err){
        return done(err,null)
    }
}))