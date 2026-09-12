import Attendance from '../models/Attendance.js';
import AttendanceSession from '../models/AttendanceSession.js';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export async function computeStudentAttendanceStats(studentId, options = {}) {
  const match = { student: studentId, status: 'present' };
  if (options.subjectId) match.subject = options.subjectId;
  if (options.class) match.class = options.class;

  const presentCount = await Attendance.countDocuments(match);

  const sessionQuery = { status: { $in: ['active', 'closed', 'expired'] } };
  if (options.subjectId) sessionQuery.subject = options.subjectId;
  if (options.class) sessionQuery.class = options.class;

  const totalSessions = await AttendanceSession.countDocuments(sessionQuery);
  const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const markedToday = await Attendance.findOne({
    student: studentId,
    date: { $gte: todayStart, $lte: todayEnd },
    status: 'present',
  }).populate('subject', 'name code');

  return {
    presentCount,
    totalSessions,
    percentage,
    markedToday,
    lowAttendanceWarning: percentage < 75 && totalSessions > 0,
  };
}

export async function subjectWiseStats(studentId) {
  const pipeline = [
    { $match: { student: studentId, status: 'present' } },
    {
      $group: {
        _id: '$subject',
        present: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subject',
      },
    },
    { $unwind: '$subject' },
  ];
  const presentBySubject = await Attendance.aggregate(pipeline);

  const results = [];
  for (const row of presentBySubject) {
    const totalSessions = await AttendanceSession.countDocuments({
      subject: row._id,
      class: row.subject.class,
    });
    const percentage = totalSessions > 0 ? Math.round((row.present / totalSessions) * 100) : 0;
    results.push({
      subject: row.subject,
      present: row.present,
      totalSessions,
      percentage,
    });
  }
  return results;
}
