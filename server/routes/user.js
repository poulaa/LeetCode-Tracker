import express from 'express';
import passport from 'passport';
import User from '../models/User.js';

const router = express.Router();

// 🔐 Start Google OAuth login
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 🔄 Google OAuth callback
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:3000',
    failureRedirect: '/api/user/login/failed',
  })
);

// 🚪 Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000');
  });
});

// 🧠 Return current logged-in user
router.get('/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

// 🚫 Failed login
router.get('/login/failed', (req, res) => {
  res.status(401).json({ message: 'Login failed' });
});

// ✅ Save solved problems to DB (POST)
router.post('/update-solved', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const { solved } = req.body;
    await User.findByIdAndUpdate(req.user._id, { solved });
    res.json({ message: 'Progress saved' });
  } catch (err) {
    console.error('Error saving progress:', err);
    res.status(500).json({ message: 'Failed to save progress' });
  }
});

// 🏆 Leaderboard route (GET)
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({})
      .select('name photo solved')
      .lean();

    const ranked = users
      .map((u) => ({
        name: u.name,
        photo: u.photo,
        solvedCount: u.solved?.length || 0,
      }))
      .sort((a, b) => b.solvedCount - a.solvedCount);

    res.json(ranked);
  } catch (err) {
    console.error('Error loading leaderboard:', err);
    res.status(500).json({ message: 'Failed to load leaderboard' });
  }
});

export default router;
