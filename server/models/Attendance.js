import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    class: { type: String, required: true, trim: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, session: 1 }, { unique: true });
attendanceSchema.index({ student: 1, subject: 1, date: 1 });
attendanceSchema.index({ session: 1 });
attendanceSchema.index({ class: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
