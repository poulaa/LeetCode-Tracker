// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  photo: String, // ✅ Add this
  solved: [Number], // optional if you're saving problem indexes
});

export default mongoose.model('User', userSchema);
