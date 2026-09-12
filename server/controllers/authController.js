import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { signToken } from '../utils/jwt.js';

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
    teacherId: user.teacherId,
    department: user.department,
    class: user.class,
  };
}

export async function register(req, res) {
  try {
    const { name, email, password, role, rollNumber, employeeId, department, class: className } =
      req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password, and role are required' });
    }
    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ message: 'Registration allowed only for student or teacher' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    let studentRef = null;
    let teacherRef = null;

    if (role === 'student') {
      if (!rollNumber || !className) {
        return res.status(400).json({ message: 'Roll number and class are required for students' });
      }
      const dupRoll = await Student.findOne({ rollNumber });
      if (dupRoll) {
        return res.status(409).json({ message: 'Roll number already exists' });
      }
    }

    if (role === 'teacher') {
      if (!employeeId) {
        return res.status(400).json({ message: 'Employee ID is required for teachers' });
      }
      const dupEmp = await Teacher.findOne({ employeeId });
      if (dupEmp) {
        return res.status(409).json({ message: 'Employee ID already exists' });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department: department || '',
      class: className || '',
    });

    if (role === 'student') {
      const student = await Student.create({
        user: user._id,
        rollNumber,
        name,
        email,
        department: department || '',
        class: className,
      });
      studentRef = student._id;
      user.studentId = student._id;
      user.class = className;
      await user.save();
    }

    if (role === 'teacher') {
      const teacher = await Teacher.create({
        user: user._id,
        employeeId,
        name,
        email,
        department: department || '',
      });
      teacherRef = teacher._id;
      user.teacherId = teacher._id;
      await user.save();
    }

    const token = signToken(user._id);
    return res.status(201).json({
      token,
      user: userResponse(user),
      profileIds: { studentId: studentRef, teacherId: teacherRef },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    return res.json({ token, user: userResponse(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
}

export async function me(req, res) {
  return res.json({ user: userResponse(req.user) });
}

export async function seedAdmin(req, res) {
  try {
    const { name, email, password, secret } = req.body;
    if (secret !== process.env.ADMIN_SEED_SECRET && !process.env.ADMIN_SEED_SECRET) {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(403).json({ message: 'Admin already exists' });
      }
    } else if (secret !== process.env.ADMIN_SEED_SECRET) {
      return res.status(403).json({ message: 'Invalid seed secret' });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, password required' });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });
    const token = signToken(user._id);
    return res.status(201).json({ token, user: userResponse(user) });
  } catch (err) {
    return res.status(500).json({ message: 'Could not create admin' });
  }
}
