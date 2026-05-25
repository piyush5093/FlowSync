const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Update = require('../models/Update');
const Message = require('../models/Message');
const Team = require('../models/Team');
const { protect, authorize } = require('../middleware/authMiddleware');
const { generateTeamSummary, getSmartSuggestion } = require('../services/groqService');

// Protect all routes in this router - only allow managers
router.use(protect);
router.use(authorize('manager'));

// @desc    Get all members with their today's update status
// @route   GET /api/manager/team
// @access  Private (Manager only)
router.get('/team', async (req, res) => {
  try {
    // Find the manager's team
    const team = await Team.findOne({ managerId: req.user.id });
    if (!team) {
      return res.json({ success: true, data: [] });
    }

    // 1. Fetch team members
    const members = await User.find({ _id: { $in: team.members } }).select('-password');

    // 2. Fetch updates for the last 7 days (today and 6 days prior)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const weeklyUpdates = await Update.find({
      date: { $gte: sevenDaysAgo, $lte: today },
      teamId: team._id
    });

    // Group updates by userId
    const updatesByUser = {};
    weeklyUpdates.forEach(update => {
      const uId = update.userId.toString();
      if (!updatesByUser[uId]) {
        updatesByUser[uId] = [];
      }
      updatesByUser[uId].push(update);
    });

    // 3. Format members list with today's status, weekly history, and count
    const teamStatus = members.map(member => {
      const mId = member._id.toString();
      const mUpdates = updatesByUser[mId] || [];

      // Find today's update
      const todayUpdateRecord = mUpdates.find(u => new Date(u.date).getTime() === today.getTime());
      const todayUpdate = todayUpdateRecord ? {
        id: todayUpdateRecord._id,
        updateText: todayUpdateRecord.updateText,
        sentiment: todayUpdateRecord.sentiment,
        summary: todayUpdateRecord.summary || '',
        hasBlocker: todayUpdateRecord.hasBlocker || false,
        blockerText: todayUpdateRecord.blockerText || '',
        submittedAt: todayUpdateRecord.createdAt
      } : null;

      // Construct 7-day timeline (from 6 days ago up to today)
      const weeklyHistory = [];
      let totalUpdatesThisWeek = 0;

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Mon"

        const dayUpdate = mUpdates.find(u => {
          const uDate = new Date(u.date).toISOString().split('T')[0];
          return uDate === dayStr;
        });

        if (dayUpdate) {
          totalUpdatesThisWeek++;
        }

        weeklyHistory.push({
          day: dayName[0], // Single letter (M, T, W, etc.)
          date: dayStr,
          submitted: !!dayUpdate,
          sentiment: dayUpdate ? dayUpdate.sentiment : null,
          hasBlocker: dayUpdate ? dayUpdate.hasBlocker : false
        });
      }

      return {
        id: member._id,
        name: member.name,
        email: member.email,
        createdAt: member.createdAt,
        managerNote: member.managerNote || '',
        todayUpdate,
        weeklyHistory,
        totalUpdatesThisWeek
      };
    });

    res.json({ success: true, data: teamStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Generate today's team summary using AI
// @route   GET /api/manager/ai-summary
// @access  Private (Manager only)
router.get('/ai-summary', async (req, res) => {
  try {
    const team = await Team.findOne({ managerId: req.user.id });
    if (!team) {
      return res.json({
        success: true,
        data: {
          overallMood: 'Neutral',
          summary: 'No team configured yet. Create a team to generate summaries.',
          topAchievement: 'None.',
          mainBlocker: 'None.',
          suggestion: 'Go to your dashboard to create a team.'
        }
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch today's updates and populate member name
    const updates = await Update.find({ date: today, teamId: team._id }).populate('userId', 'name');

    if (updates.length === 0) {
      return res.json({
        success: true,
        data: {
          overallMood: 'Neutral',
          summary: 'No updates have been submitted by the team today yet.',
          topAchievement: 'None reported.',
          mainBlocker: 'None reported.',
          suggestion: 'Encourage your team members to submit their daily updates.'
        }
      });
    }

    // Format updates list for Groq SDK
    const formattedUpdates = updates.map(u => ({
      memberName: u.userId ? u.userId.name : 'Unknown Member',
      updateText: u.updateText,
      sentiment: u.sentiment,
      hasBlocker: u.hasBlocker,
      blockerText: u.blockerText
    }));

    // Call Groq SDK helper for generating team summaries
    const aiSummary = await generateTeamSummary(formattedUpdates);

    res.json({ success: true, data: aiSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get updates count grouped by day for last 7 days
// @route   GET /api/manager/updates/weekly
// @access  Private (Manager only)
router.get('/updates/weekly', async (req, res) => {
  try {
    const team = await Team.findOne({ managerId: req.user.id });
    if (!team) {
      return res.json({ success: true, data: [] });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get updates for last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const updates = await Update.find({
      date: { $gte: sevenDaysAgo, $lte: today },
      teamId: team._id
    });

    // Map dates to counts
    const countsMap = {};
    updates.forEach(u => {
      const dateStr = new Date(u.date).toISOString().split('T')[0];
      countsMap[dateStr] = (countsMap[dateStr] || 0) + 1;
    });

    // Build chronological last 7 days array
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Mon"
      
      weeklyData.push({
        day: dayName,
        date: dateStr,
        updates: countsMap[dateStr] || 0
      });
    }

    res.json({ success: true, data: weeklyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get specific member details & last 7 days updates
// @route   GET /api/manager/member/:id
// @access  Private (Manager only)
router.get('/member/:id', async (req, res) => {
  try {
    const memberId = req.params.id;

    const team = await Team.findOne({ managerId: req.user.id });
    if (!team || !team.members.includes(memberId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this member' });
    }

    // Fetch member user details
    const member = await User.findOne({ _id: memberId, role: 'member' }).select('-password');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Get updates from last 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const updates = await Update.find({
      userId: memberId,
      date: { $gte: sevenDaysAgo, $lte: today }
    }).sort({ date: -1 });

    // Map dates to updates lookup
    const updatesMap = {};
    updates.forEach(u => {
      const dateStr = new Date(u.date).toISOString().split('T')[0];
      updatesMap[dateStr] = u;
    });

    // Build timeline for last 7 days
    const timeline = [];
    let totalUpdatesThisWeek = 0;
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const update = updatesMap[dateStr] || null;

      if (update) totalUpdatesThisWeek++;

      timeline.push({
        dayName,
        date: dateStr,
        submitted: !!update,
        sentiment: update ? update.sentiment : null,
        updateText: update ? update.updateText : null
      });
    }

    // Get last 3 updates to evaluate work pattern
    const last3 = updates.slice(0, 3).map(u => ({ text: u.updateText, date: u.date }));
    const aiAnalysis = await getSmartSuggestion(last3);

    res.json({
      success: true,
      data: {
        member: {
          id: member._id,
          name: member.name,
          email: member.email,
          createdAt: member.createdAt,
          managerNote: member.managerNote || ''
        },
        timeline,
        totalUpdatesThisWeek,
        aiAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Send a feedback message to a team member
// @route   POST /api/manager/message
// @access  Private (Manager only)
router.post('/message', async (req, res) => {
  try {
    const { receiverId, messageText } = req.body;
    if (!receiverId || !messageText || !messageText.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver ID and message text are required' });
    }

    const team = await Team.findOne({ managerId: req.user.id });
    if (!team || !team.members.includes(receiverId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to message this member' });
    }

    const receiver = await User.findOne({ _id: receiverId, role: 'member' });
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Member recipient not found' });
    }

    const newMessage = await Message.create({
      senderId: req.user.id,
      receiverId,
      messageText: messageText.trim()
    });

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a member's private manager note
// @route   PUT /api/manager/member/:id/note
// @access  Private (Manager only)
router.put('/member/:id/note', async (req, res) => {
  try {
    const memberId = req.params.id;
    const { note } = req.body;

    const team = await Team.findOne({ managerId: req.user.id });
    if (!team || !team.members.includes(memberId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage this member' });
    }

    const member = await User.findOne({ _id: memberId, role: 'member' });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    member.managerNote = note !== undefined ? note.trim() : '';
    await member.save();

    res.json({ success: true, message: 'Private note saved successfully', data: member.managerNote });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
