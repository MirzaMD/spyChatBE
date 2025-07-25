import { Router } from "express";
import { body,matchedData,validationResult } from "express-validator";
import users from "../../model/users.mjs";
import { hashing } from "../../hashing/bcrypting.mjs";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import { MailSender } from "../mail/mailservice.mjs";
dotenv.config();
const userObj = Router();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
userObj.post("/api/signup",
    [
        body("username").notEmpty().withMessage("username cannot be empty")
        .custom((val)=>val.trim() !=="").withMessage("username cannot be blank"),
        body("password").isString().withMessage("Password is not strong enough"),
        body("authType").notEmpty().withMessage("auth type must be specified")
        .custom((val)=>val.trim().toLowerCase()==="local" || val.trim().toLowerCase() ==="discord"
        || val.trim().toLowerCase()==="github")
        .withMessage("auth type must be either local, discord, github or instagram"),
        body("profile").notEmpty().withMessage("Profile is required."),
        body("email").isEmail().withMessage("email is required.")
    ],async (request, response)=>{
      const result = validationResult(request);
      if(!result.isEmpty())
        return response.status(400).json(result.array().map((err)=>err.msg))
    const data = matchedData(request);
    data.password = hashing(data.password);
    try{
        const cloudUploadResult = await cloudinary.v2.uploader.upload(data.profile);
         const newUser = new users({
         username: data.username,
         password: data.password,
         email: data.email,
         authType:"local",
         profile: cloudUploadResult.secure_url 
    });
        await newUser.save();
          try {
    await MailSender(data.email, data.username);
  } catch (emailErr) {
    console.error("Email sending failed:", emailErr); // Log it
    // Optionally send a 207 (multi-status) or warning response
    return response.status(201).json({
      message: "User added, but email sending failed.",
      emailError: emailErr.message
    });
  }
        return response.status(201).json({message:"user added."})
    }
    catch(err){
        return response.status(400).json({error:err})
    }
    }
)

userObj.patch("/api/user/editProfile/:id",[
    body("profile").isString().withMessage("must be a string").optional(),
    body("bio").isString().optional(),
    body("username").isString().optional(),
    body("email").isEmail().optional()
],async (req,res)=>{
    const result=validationResult(req);
    if(!result.isEmpty()) return res.status(400).json(result.array().map(err=>err.msg));
    const changes=matchedData(req);
    if(changes.profile){
        const uploaded = await cloudinary.v2.uploader.upload(changes.profile);
        changes.profile=uploaded.secure_url;
    }
    if(changes.email){
        await MailSender(changes.email,changes.username);
    }
    const { id }= req.params;
    try{
        const user = await users.findById(id);
        if(!user) return res.status(401).json({message:"user not found"});
        user.set(changes);
        await user.save();
        return res.sendStatus(200);
    }
    catch(err){
        return res.status(400).json({error:err})
    }
})

userObj.get("/api/allusers",async (_,res)=>{
    try{
        const user = await users.find({});
        if(!users) return res.status(400).json({message:"no users available"})
            return res.status(200).json(user); 
    }
    catch(err){
        return res.status(400).json(err);
    }
})

userObj.get("/api/singleUser/:id",async(req,res)=>{
    try{
        const { id } = req.params;
        const user = await users.findById(id);
        if(!user) return res.status(404).json({message:"user not found"});
        return res.status(200).json(user);
    }
    catch(err){
        return res.status(400).json(err);
    }
})

userObj.delete("/api/deactivate", async (req,res)=>{
    try{
        if(req.user){
            const { id } = req.user;
            await users.findByIdAndDelete(id);
            return res.sendStatus(200);
        }
    }catch(err){
        return res.status(400).json({message:"failed to deactivate"})
    }
})
export default userObj;