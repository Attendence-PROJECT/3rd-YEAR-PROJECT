import Attendance from '../models/Attendance.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Student from '../models/Student.js';
import {
  computeStudentAttendanceStats,
  subjectWiseStats,
} from '../utils/attendanceStats.js';

async function expireStaleSessions() {
  await AttendanceSession.updateMany(
    { status: 'active', expiresAt: { $lt: new Date() } },
    { $set: { status: 'expired' } }
  );
}

export async function markAttendance(req, res) {
  try {
    await expireStaleSessions();
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can mark attendance via QR' });
    }
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const { sessionToken } = req.body;
    if (!sessionToken) {
      return res.status(400).json({ message: 'Session token is required' });
    }

    const session = await AttendanceSession.findOne({ sessionToken });
    if (!session) {
      return res.status(404).json({ message: 'Invalid or unknown session QR' });
    }
    if (session.status !== 'active') {
      return res.status(400).json({ message: `Session is ${session.status}` });
    }
    if (new Date() > session.expiresAt) {
      session.status = 'expired';
      await session.save();
      return res.status(400).json({ message: 'Session QR has expired' });
    }
    if (session.class !== student.class) {
      return res.status(403).json({ message: 'This session is for a different class' });
    }

    const duplicate = await Attendance.findOne({ student: student._id, session: session._id });
    if (duplicate) {
      return res.status(409).json({ message: 'Attendance already marked for this session' });
    }

    const record = await Attendance.create({
      student: student._id,
      teacher: session.teacher,
      subject: session.subject,
      class: session.class,
      session: session._id,
      date: session.date,
      status: 'present',
      markedAt: new Date(),
    });

    const populated = await Attendance.findById(record._id)
      .populate('subject', 'name code')
      .populate('session', 'sessionToken expiresAt');

    return res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: populated,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate attendance' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to mark attendance' });
  }
}

export async function getStudentAttendance(req, res) {
  try {
    let studentId = req.params.studentId;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (!student) return res.status(404).json({ message: 'Student not found' });
      if (studentId && studentId !== 'me' && studentId !== student._id.toString()) {
        return res.status(403).json({ message: 'Cannot view other students attendance' });
      }
      studentId = student._id.toString();
    }

    const { subjectId, from, to } = req.query;
    const filter = { student: studentId };
    if (subjectId) filter.subject = subjectId;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const records = await Attendance.find(filter)
      .populate('subject', 'name code class')
      .populate('teacher', 'name')
      .sort({ date: -1 })
      .limit(200);

    const stats = await computeStudentAttendanceStats(studentId);
    const bySubject = await subjectWiseStats(studentId);

    return res.json({ records, stats, bySubject });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attendance' });
  }
}

export async function getSubjectAttendance(req, res) {
  try {
    const { subjectId } = req.params;
    const records = await Attendance.find({ subject: subjectId })
      .populate('student', 'name rollNumber class')
      .sort({ date: -1 })
      .limit(500);
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch subject attendance' });
  }
}
