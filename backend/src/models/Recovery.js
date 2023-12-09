import mongoose from 'mongoose';

const RecoverySchema = new mongoose.Schema({
  user_email: {
    type: String,
    ref: 'User',
    required: true,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
});

export default mongoose.model('Recovery', RecoverySchema);


