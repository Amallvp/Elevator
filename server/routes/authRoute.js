import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';
const r = Router();

r.post('/register', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, role });
    res.json({ id: user._id });
  } catch (e) { next(e); }
});

r.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    console.log(ok);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ uid: user._id, role: user.role, email }, process.env.JWT_SECRET, { expiresIn:  '1h' });
    res.json({ token });
  } catch (e) { next(e); }
});

export default r;