import { Schema, model } from "mongoose";

const schema= new Schema({
    username:{type:String, rerquired:true, unique:true}, 
    profile:{ type:String },
    discordId:{type:String, sparse: true},
    githubId:{type: String, sparse: true},
    googleId:{type: String, sparse: true},
    password:{type: String, sparse: true},
    email:{ type:String, sparse:true },
    bio:{ type:String, default:"Hey there fellow spy!"},
    authType:{type:String, required : true}
},
{timestamps:true, collection:"users"}
);
const users = model("users",schema);
export default users;
