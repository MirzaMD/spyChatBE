import passport from "passport";
import { Strategy } from "passport-discord";
import users from "../model/users.mjs"
import dotenv from "dotenv";
dotenv.config();
passport.serializeUser((user,done)=>{
    done(null,user._id)
})

passport.deserializeUser(async (id, done)=>{
   try{
    const user = await users.findById(id);
    if(!user)
        return done(null, false);
    done(null,user)
   }catch(err){
    done(err,null);
   }
})

export default passport.use(new Strategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    scope: ["identify", "guilds", "email"],
    callbackURL: "https://spychatbe.onrender.com/auth/discord/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("Discord profile:", profile); // ✅ add this
        const user = await users.findOne({ discordId: profile.id });

        if (!user) {
            const newUser = await users.create({
                username: profile.username,
                discordId: profile.id,
                authType: "discord"
            });
            const saved = await newUser.save();
            return done(null, saved);
        }

        return done(null, user);
    } catch (err) {
        console.error("Error in Discord Strategy:", err); // ✅ add this
        return done(err, null);
    }
}));
