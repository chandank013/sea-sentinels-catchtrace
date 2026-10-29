import express from 'express';
import jwt from 'jsonwebtoken';
import { USERS } from '../db/store.js';
import { config } from '../config.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { role, pin, email, identifier } = req.body;
  const loginEmail = (email || identifier || '').trim().toLowerCase();
  const rawPin = (pin || '').trim();

  if (!rawPin) {
    return res.status(400).json({ error: '4-digit security PIN is required' });
  }

  // 1. If email / identifier provided (Primary standard login flow)
  if (loginEmail) {
    const user = Object.values(USERS).find(
      (u) =>
        u.name.toLowerCase() === loginEmail ||
        u.id.toLowerCase() === loginEmail ||
        u.role.toLowerCase() === loginEmail ||
        (u.email && u.email.toLowerCase() === loginEmail)
    );

    if (!user) {
      return res.status(404).json({
        error: `No account found with email "${email || identifier}". Please check your email or register.`,
      });
    }

    if (user.pin !== rawPin) {
      return res.status(401).json({
        error: `Incorrect security PIN for ${user.name || user.email}. Please try again.`,
      });
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
        email: user.email,
        role: user.role,
        roleLabel: user.roleLabel || user.role,
        org: user.org,
        location: user.location,
      },
    });
  }

  // 2. Fallback if role is provided directly
  if (role) {
    const roleUpper = role.trim().toUpperCase();
    let user = USERS[roleUpper];
    if (!user || user.pin !== rawPin) {
      const matched = Object.values(USERS).find((u) => u.role === roleUpper && u.pin === rawPin);
      if (matched) user = matched;
    }

    if (!user) {
      return res.status(404).json({ error: `User profile not found for role ${role}` });
    }

    if (user.pin !== rawPin) {
      return res.status(401).json({ error: `Incorrect PIN for ${user.roleLabel || user.role}` });
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
        email: user.email,
        role: user.role,
        roleLabel: user.roleLabel || user.role,
        org: user.org,
        location: user.location,
      },
    });
  }

  return res.status(400).json({ error: 'Email address and 4-digit PIN are required to sign in' });
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
