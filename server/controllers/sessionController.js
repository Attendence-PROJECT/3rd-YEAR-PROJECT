import { v4 as uuidv4 } from 'uuid';
import AttendanceSession from '../models/AttendanceSession.js';
import Attendance from '../models/Attendance.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';

const DEFAULT_DURATION_MIN = 15;

async function expireStaleSessions() {
  await AttendanceSession.updateMany(
    { status: 'active', expiresAt: { $lt: new Date() } },
    { $set: { status: 'expired' } }
  );
}

export async function createSession(req, res) {
  try {
    await expireStaleSessions();
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create sessions' });
    }
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const { subjectId, class: className, durationMinutes } = req.body;
    if (!subjectId || !className) {
      return res.status(400).json({ message: 'Subject and class are required' });
    }
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.class !== className) {
      return res.status(400).json({ message: 'Subject does not belong to this class' });
    }

    const duration = Number(durationMinutes) || DEFAULT_DURATION_MIN;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 60 * 1000);
    const sessionToken = uuidv4();

    const session = await AttendanceSession.create({
      teacher: teacher._id,
      subject: subject._id,
      class: className,
      date: now,
      startTime: now,
      expiresAt,
      sessionToken,
      status: 'active',
    });

    const populated = await AttendanceSession.findById(session._id)
      .populate('subject', 'name code class')
      .populate('teacher', 'name employeeId');

    return res.status(201).json({
      session: populated,
      qrPayload: sessionToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create session' });
  }
}

export async function listSessions(req, res) {
  try {
    await expireStaleSessions();
    const filter = {};
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (!teacher) return res.json([]);
      filter.teacher = teacher._id;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.class) filter.class = req.query.class;
    if (req.query.subjectId) filter.subject = req.query.subjectId;

    const sessions = await AttendanceSession.find(filter)
      .populate('subject', 'name code')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(sessions);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list sessions' });
  }
}

export async function getSession(req, res) {
  try {
    await expireStaleSessions();
    const session = await AttendanceSession.findById(req.params.id)
      .populate('subject', 'name code class')
      .populate('teacher', 'name employeeId');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    return res.json(session);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch session' });
  }
}

export async function closeSession(req, res) {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can close sessions' });
    }
    const teacher = await Teacher.findOne({ user: req.user._id });
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (!teacher || session.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: 'Not your session' });
    }
    session.status = 'closed';
    await session.save();
    return res.json(session);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to close session' });
  }
}

export async function getSessionAttendance(req, res) {
  try {
    const sessionId = req.params.sessionId || req.params.id;
    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (!teacher || session.teacher.toString() !== teacher._id.toString()) {
        return res.status(403).json({ message: 'Not your session' });
      }
    }

    const records = await Attendance.find({ session: session._id })
      .populate('student', 'name rollNumber class')
      .sort({ markedAt: -1 });
    return res.json({ session, records });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch session attendance' });
  }
}
