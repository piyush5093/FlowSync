const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// Helper function to generate unique 6-digit invite code (e.g., FL4829)
const generateInviteCode = async () => {
  const chars = '0123456789';
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    code = 'FL';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const existingTeam = await Team.findOne({ inviteCode: code });
    if (!existingTeam) {
      isUnique = true;
    }
  }
  return code;
};

// @desc    Create a new team
// @route   POST /api/teams/create
// @access  Private (Manager only)
router.post('/create', protect, authorize('manager'), async (req, res) => {
  try {
    const { teamName } = req.body;

    if (!teamName || !teamName.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a team name' });
    }

    // Check if manager already has a team
    const existingTeam = await Team.findOne({ managerId: req.user.id });
    if (existingTeam) {
      return res.status(400).json({ success: false, message: 'Manager already has a team' });
    }

    const inviteCode = await generateInviteCode();

    const team = await Team.create({
      name: teamName.trim(),
      managerId: req.user.id,
      inviteCode,
      members: []
    });

    // Update manager's teamId
    req.user.teamId = team._id;
    await req.user.save();

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Join an existing team
// @route   POST /api/teams/join
// @access  Private (Member only)
router.post('/join', protect, authorize('member'), async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode || !inviteCode.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide an invite code' });
    }

    const formattedCode = inviteCode.trim().toUpperCase();

    // Find the team with the invite code
    const team = await Team.findOne({ inviteCode: formattedCode });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Invalid invite code' });
    }

    // Remove member from any previous team they belonged to
    await Team.updateOne(
      { members: req.user.id },
      { $pull: { members: req.user.id } }
    );

    // Add member to the new team's members array
    if (!team.members.includes(req.user.id)) {
      team.members.push(req.user.id);
      await team.save();
    }

    // Update member's teamId field
    req.user.teamId = team._id;
    await req.user.save();

    res.json({
      success: true,
      message: `Welcome to ${team.name}! 🎉`,
      teamName: team.name
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current user's team details
// @route   GET /api/teams/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    let team = null;

    if (req.user.role === 'manager') {
      team = await Team.findOne({ managerId: req.user.id });
    } else if (req.user.teamId) {
      team = await Team.findById(req.user.teamId);
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
