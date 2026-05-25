const express = require('express');
const router = express.Router();
const Update = require('../models/Update');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');
const { analyzeUpdate } = require('../services/groqService');

// @desc    Submit a new team update (or append to today's update)
// @route   POST /api/updates
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { updateText } = req.body;

    if (!updateText || !updateText.trim()) {
      return res.status(400).json({ success: false, message: 'Please add update text' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already updated today
    let updateRecord = await Update.findOne({ userId: req.user.id, date: today });
    let fullText = updateText.trim();

    if (updateRecord) {
      // Append text to existing update with spacing
      updateRecord.updateText = `${updateRecord.updateText}\n\n${updateText.trim()}`;
      fullText = updateRecord.updateText;
    }

    // Call Groq API to analyze update
    const aiAnalysis = await analyzeUpdate(fullText);

    if (updateRecord) {
      updateRecord.sentiment = aiAnalysis.sentiment;
      updateRecord.summary = aiAnalysis.summary;
      updateRecord.hasBlocker = aiAnalysis.hasBlocker;
      updateRecord.blockerText = aiAnalysis.blockerText;
      updateRecord.encouragement = aiAnalysis.encouragement;
      await updateRecord.save();
    } else {
      // Create new daily update
      updateRecord = await Update.create({
        userId: req.user.id,
        updateText: fullText,
        sentiment: aiAnalysis.sentiment,
        summary: aiAnalysis.summary,
        hasBlocker: aiAnalysis.hasBlocker,
        blockerText: aiAnalysis.blockerText,
        encouragement: aiAnalysis.encouragement,
        date: today
      });
    }

    res.status(201).json({ 
      success: true, 
      data: updateRecord,
      encouragement: aiAnalysis.encouragement 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get logged in user's updates and statistics
// @route   GET /api/updates/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    // Fetch all user updates sorted descending
    const updates = await Update.find({ userId: req.user.id }).sort({ date: -1 });

    // Normalize today for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map updates to YYYY-MM-DD strings for date lookup
    const updateDates = new Set(
      updates.map(u => {
        const d = new Date(u.date);
        return d.toISOString().split('T')[0];
      })
    );

    // --- Calculate Streak ---
    let currentStreak = 0;
    let checkDate = new Date(today);
    const todayStr = checkDate.toISOString().split('T')[0];
    const hasToday = updateDates.has(todayStr);

    if (!hasToday) {
      // If no update today, check if yesterday was updated to continue streak
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (updateDates.has(checkDate.toISOString().split('T')[0])) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // --- Calculate 7-Day History calendar row ---
    // Generate dates chronologically from 6 days ago up to today
    const history7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. "Mon"
      
      history7Days.push({
        dayName: dayName[0], // Single letter day (M, T, W, T, F, S, S)
        date: dateStr,
        submitted: updateDates.has(dateStr)
      });
    }

    // --- Calculate Week metrics (last 7 days window) ---
    const thisWeekUpdates = updates.filter(u => {
      const uDate = new Date(u.date);
      const diffTime = today - uDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 7;
    });

    const thisWeekCount = thisWeekUpdates.length;

    // --- Calculate Mood Score ---
    let posCount = 0;
    let negCount = 0;
    thisWeekUpdates.forEach(u => {
      if (u.sentiment === 'positive') posCount++;
      if (u.sentiment === 'negative') negCount++;
    });

    let moodScore = 'Neutral';
    if (thisWeekUpdates.length > 0) {
      if (negCount > posCount) {
        moodScore = 'Needs Attention';
      } else if (posCount > negCount) {
        moodScore = 'Good';
      }
    }

    res.json({
      success: true,
      data: {
        updates,
        stats: {
          currentStreak,
          thisWeekCount,
          moodScore,
          history7Days
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get member's received messages from manager
// @route   GET /api/updates/messages
// @access  Private (Member only)
router.get('/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name');
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
