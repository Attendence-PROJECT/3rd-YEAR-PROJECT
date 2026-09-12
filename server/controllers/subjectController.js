import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';

export async function listSubjects(req, res) {
  try {
    const { class: className, department, teacherId } = req.query;
    const filter = {};
    if (className) filter.class = className;
    if (department) filter.department = department;
    if (teacherId) filter.teacher = teacherId;
    const subjects = await Subject.find(filter)
      .populate('teacher', 'name employeeId')
      .sort({ code: 1 });
    return res.json(subjects);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch subjects' });
  }
}

export async function getSubject(req, res) {
  try {
    const subject = await Subject.findById(req.params.id).populate('teacher', 'name employeeId');
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    return res.json(subject);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch subject' });
  }
}

export async function createSubject(req, res) {
  try {
    const { code, name, department, class: className, teacherId } = req.body;
    if (!code || !name || !className) {
      return res.status(400).json({ message: 'Code, name, and class are required' });
    }
    const subject = await Subject.create({
      code,
      name,
      department: department || '',
      class: className,
      teacher: teacherId || null,
    });
    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, { $addToSet: { subjects: subject._id } });
    }
    return res.status(201).json(subject);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Subject code already exists' });
    }
    return res.status(500).json({ message: 'Failed to create subject' });
  }
}

export async function updateSubject(req, res) {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    const { code, name, department, class: className, teacherId } = req.body;
    const oldTeacher = subject.teacher?.toString();
    if (code) subject.code = code;
    if (name) subject.name = name;
    if (department !== undefined) subject.department = department;
    if (className) subject.class = className;
    if (teacherId !== undefined) subject.teacher = teacherId || null;
    await subject.save();

    if (oldTeacher && oldTeacher !== (teacherId || '')) {
      await Teacher.findByIdAndUpdate(oldTeacher, { $pull: { subjects: subject._id } });
    }
    if (teacherId) {
      await Teacher.findByIdAndUpdate(teacherId, { $addToSet: { subjects: subject._id } });
    }
    return res.json(subject);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update subject' });
  }
}

export async function deleteSubject(req, res) {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    if (subject.teacher) {
      await Teacher.findByIdAndUpdate(subject.teacher, { $pull: { subjects: subject._id } });
    }
    await subject.deleteOne();
    return res.json({ message: 'Subject deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete subject' });
  }
}
