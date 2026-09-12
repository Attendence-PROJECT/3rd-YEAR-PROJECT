import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Attendance from '../models/Attendance.js';
import AttendanceSession from '../models/AttendanceSession.js';
import Subject from '../models/Subject.js';
import {
  computeStudentAttendanceStats,
  subjectWiseStats,
} from '../utils/attendanceStats.js';

export async function studentReport(req, res) {
  try {
    const { id } = req.params;
    if (req.user.role === 'student') {
      const self = await Student.findOne({ user: req.user._id });
      if (!self || self._id.toString() !== id) {
        return res.status(403).json({ message: 'Cannot view other student reports' });
      }
    }
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const stats = await computeStudentAttendanceStats(id);
    const bySubject = await subjectWiseStats(id);
    const history = await Attendance.find({ student: id })
      .populate('subject', 'name code')
      .sort({ date: -1 })
      .limit(100);

    return res.json({ student, stats, bySubject, history });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to generate student report' });
  }
}

export async function classReport(req, res) {
  try {
    const { classId } = req.params;
    const students = await Student.find({ class: classId });
    const studentIds = students.map((s) => s._id);

    const sessions = await AttendanceSession.find({ class: classId });
    const totalSessions = sessions.length;

    const report = [];
    for (const st of students) {
      const present = await Attendance.countDocuments({
        student: st._id,
        class: classId,
        status: 'present',
      });
      const percentage = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0;
      report.push({
        student: st,
        present,
        totalSessions,
        percentage,
        belowThreshold: percentage < 75 && totalSessions > 0,
      });
    }

    return res.json({
      class: classId,
      totalSessions,
      students: report,
      below75: report.filter((r) => r.belowThreshold),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to generate class report' });
  }
}

export async function subjectReport(req, res) {
  try {
    const { subjectId } = req.params;
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const totalSessions = await AttendanceSession.countDocuments({ subject: subjectId });
    const students = await Student.find({ class: subject.class });

    const rows = [];
    for (const st of students) {
      const present = await Attendance.countDocuments({
        student: st._id,
        subject: subjectId,
        status: 'present',
      });
      const percentage = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0;
      rows.push({ student: st, present, totalSessions, percentage });
    }

    const daily = await Attendance.aggregate([
      { $match: { subject: new mongoose.Types.ObjectId(subjectId) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({ subject, totalSessions, students: rows, dailyTrend: daily });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to generate subject report' });
  }
}

function dayBounds(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function adminOverview(req, res) {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalSessions = await AttendanceSession.countDocuments();
    const totalMarked = await Attendance.countDocuments({ status: 'present' });

    const { start, end } = dayBounds();
    const todayAttendance = await Attendance.countDocuments({
      status: 'present',
      markedAt: { $gte: start, $lte: end },
    });

    const classes = await Student.distinct('class');
    const below75Lists = [];
    const percentageSamples = [];

    for (const cls of classes) {
      const students = await Student.find({ class: cls });
      const sessCount = await AttendanceSession.countDocuments({ class: cls });
      for (const st of students) {
        const present = await Attendance.countDocuments({ student: st._id, status: 'present' });
        const pct = sessCount > 0 ? Math.round((present / sessCount) * 100) : 0;
        if (sessCount > 0) percentageSamples.push(pct);
        if (pct < 75 && sessCount > 0) {
          below75Lists.push({ student: st, class: cls, percentage: pct });
        }
      }
    }

    const averageAttendance =
      percentageSamples.length > 0
        ? Math.round(
            percentageSamples.reduce((sum, n) => sum + n, 0) / percentageSamples.length
          )
        : 0;

    return res.json({
      totalStudents,
      totalTeachers,
      totalSubjects,
      totalSessions,
      totalMarked,
      todayAttendance,
      averageAttendance,
      classes,
      studentsBelow75: below75Lists,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load overview' });
  }
}
