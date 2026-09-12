import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    class: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    sessionToken: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'closed', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

attendanceSessionSchema.index({ sessionToken: 1 });
attendanceSessionSchema.index({ teacher: 1, status: 1 });
attendanceSessionSchema.index({ expiresAt: 1 });

export default mongoose.model('AttendanceSession', attendanceSessionSchema);
