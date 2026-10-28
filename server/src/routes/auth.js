import express from 'express';
import jwt from 'jsonwebtoken';
import { USERS } from '../db/store.js';
import { config } from '../config.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { role, pin, email, identifier } = req.body;
  const loginEmail = (email || identifier || '').trim().toLowerCase();

  // 1. If email / identifier provided
  if (loginEmail && pin) {
    const user = Object.values(USERS).find(
      (u) =>
        (u.name.toLowerCase() === loginEmail ||
          u.id === loginEmail ||
          (u.email && u.email.toLowerCase() === loginEmail)) &&
        u.pin === pin
    );

    if (user) {
      const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name, org: user.org },
        config.JWT_SECRET,
        { expiresIn: '12h' }
      );
      return res.json({ token, user });
    }
  }

  // 2. If role & PIN provided
  if (!role || !pin) {
    return res.status(400).json({ error: 'Role and PIN are required' });
  }

  const user = USERS[role.toUpperCase()];
  if (!user) {
    return res.status(404).json({ error: 'User profile not found for this role' });
  }

  if (user.pin !== pin) {
    return res.status(401).json({ error: `Incorrect PIN for ${user.roleLabel}` });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, org: user.org },
    config.JWT_SECRET,
    { expiresIn: '12h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      roleLabel: user.roleLabel,
      org: user.org,
      location: user.location,
    },
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, role, org, location, phone, email, pin } = req.body;

  if (!name || !role || !pin || pin.length < 4) {
    return res.status(400).json({ error: 'Name, role, and a 4-digit PIN are required' });
  }

  const roleUpper = role.toUpperCase();
  const newId = `usr_${roleUpper.toLowerCase()}_${Date.now()}`;

  const newUser = {
    id: newId,
    name: name.trim(),
    email: email?.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
    role: roleUpper,
    roleLabel: roleUpper,
    org: org?.trim() || `${name.trim()}'s Facility`,
    location: location?.trim() || 'Mangaluru Region',
    phone: phone?.trim() || '',
    pin: pin.trim(),
  };

  // Add to in-memory users
  USERS[newId] = newUser;

  const token = jwt.sign(
    { id: newUser.id, role: newUser.role, name: newUser.name, org: newUser.org },
    config.JWT_SECRET,
    { expiresIn: '12h' }
  );

  const { pin: _p, ...safeUser } = newUser;
  return res.status(201).json({ token, user: safeUser });
});

export default router;
