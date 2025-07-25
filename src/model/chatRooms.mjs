// model/Message.mjs
import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { collection: "messages" });

const Message = model("Message", messageSchema);
export default Message;
