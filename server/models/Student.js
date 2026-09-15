import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    department: { type: String, trim: true, default: '' },
    class: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

studentSchema.index({ class: 1 });

export default mongoose.model('Student', studentSchema);
