import express from 'express';
import { USERS, computeUserTrustScore } from '../db/store.js';

const router = express.Router();

// GET /api/users/:id/trust-score
router.get('/:id/trust-score', (req, res) => {
  const target = (req.params.id || '').trim().toLowerCase();
  
  const user = Object.values(USERS).find(
    (u) =>
      u.id.toLowerCase() === target ||
      (u.email && u.email.toLowerCase() === target) ||
      u.role.toLowerCase() === target ||
      (u.name && u.name.toLowerCase() === target)
  );

  if (!user) {
    // If user is a dynamic or new account, default to 100% trust score
    return res.json({
      user_id: req.params.id,
      trust_score: 100,
      confirmed_count: 0,
      disputed_count: 0,
      status: 'NEW_OPERATOR',
    });
  }

  const scoreData = computeUserTrustScore(user);
  return res.json({
    user_id: user.id,
    name: user.name,
    role: user.role,
    org: user.org,
    ...scoreData,
  });
});

export default router;
