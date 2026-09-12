import User from '../models/User.js';
import Student from '../models/Student.js';

export async function listStudents(req, res) {
  try {
    const { class: className, department, search } = req.query;
    const filter = {};
    if (className) filter.class = className;
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { rollNumber: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    const students = await Student.find(filter).populate('user', 'email role').sort({ name: 1 });
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch students' });
  }
}

export async function getStudent(req, res) {
  try {
    const student = await Student.findById(req.params.id).populate('user', 'email role');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    return res.json(student);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch student' });
  }
}

export async function createStudent(req, res) {
  try {
    const { name, email, password, rollNumber, department, class: className } = req.body;
    if (!name || !email || !password || !rollNumber || !className) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email already exists' });
    const dupRoll = await Student.findOne({ rollNumber });
    if (dupRoll) return res.status(409).json({ message: 'Roll number exists' });

    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      department: department || '',
      class: className,
    });
    const student = await Student.create({
      user: user._id,
      rollNumber,
      name,
      email,
      department: department || '',
      class: className,
    });
    user.studentId = student._id;
    await user.save();
    return res.status(201).json(student);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create student' });
  }
}

export async function updateStudent(req, res) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { name, rollNumber, department, class: className, email } = req.body;
    if (name) student.name = name;
    if (rollNumber) student.rollNumber = rollNumber;
    if (department !== undefined) student.department = department;
    if (className) student.class = className;
    if (email) student.email = email;
    await student.save();

    const user = await User.findById(student.user);
    if (user) {
      if (name) user.name = name;
      if (email) user.email = email;
      if (department !== undefined) user.department = department;
      if (className) user.class = className;
      await user.save();
    }
    return res.json(student);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update student' });
  }
}

export async function deleteStudent(req, res) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await User.findByIdAndDelete(student.user);
    await student.deleteOne();
    return res.json({ message: 'Student deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete student' });
  }
}
