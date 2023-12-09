import mongoose from "mongoose";

const CopyIdTrackerSchema = new mongoose.Schema({
    lastCopyId: {
      type: Number,
      default: 0,
    },
  });  
  
  export default mongoose.model("CopyIdTracker", CopyIdTrackerSchema);
  

