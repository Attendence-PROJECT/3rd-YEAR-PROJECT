import User from '../models/User.js';
import Teacher from '../models/Teacher.js';

export async function listTeachers(req, res) {
  try {
    const { department, search } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    const teachers = await Teacher.find(filter)
      .populate('user', 'email role')
      .populate('subjects', 'name code class')
      .sort({ name: 1 });
    return res.json(teachers);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch teachers' });
  }
}

export async function getTeacher(req, res) {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'email role')
      .populate('subjects', 'name code class');
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    return res.json(teacher);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch teacher' });
  }
}

export async function createTeacher(req, res) {
  try {
    const { name, email, password, employeeId, department } = req.body;
    if (!name || !email || !password || !employeeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already exists' });
    const dup = await Teacher.findOne({ employeeId });
    if (dup) return res.status(409).json({ message: 'Employee ID exists' });

    const user = await User.create({
      name,
      email,
      password,
      role: 'teacher',
      department: department || '',
    });
    const teacher = await Teacher.create({
      user: user._id,
      employeeId,
      name,
      email,
      department: department || '',
    });
    user.teacherId = teacher._id;
    await user.save();
    return res.status(201).json(teacher);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create teacher' });
  }
}

export async function updateTeacher(req, res) {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    const { name, employeeId, department, email, subjectIds } = req.body;
    if (name) teacher.name = name;
    if (employeeId) teacher.employeeId = employeeId;
    if (department !== undefined) teacher.department = department;
    if (email) teacher.email = email;
    if (Array.isArray(subjectIds)) teacher.subjects = subjectIds;
    await teacher.save();

    const user = await User.findById(teacher.user);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (department !== undefined) user.department = department;
      await user.save();
    }
    return res.json(teacher);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update teacher' });
  }
}

export async function deleteTeacher(req, res) {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    await User.findByIdAndDelete(teacher.user);
    await teacher.deleteOne();
    return res.json({ message: 'Teacher deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete teacher' });
  }
}
