const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

let groq;
try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  } else {
    console.warn('Warning: GROQ_API_KEY environment variable is not defined.');
  }
} catch (error) {
  console.error('Error initializing Groq SDK client:', error.message);
}

/**
 * Helper to call Groq with JSON structure format
 */
const getGroqJsonResponse = async (promptText) => {
  if (!groq) {
    throw new Error('Groq client is not initialized due to missing API key.');
  }

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: promptText
      }
    ],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  return JSON.parse(response.choices[0].message.content);
};

/**
 * FUNCTION 1 — analyzeUpdate(updateText)
 * Evaluates sentiment, builds a summary, checks blockers, and generates motivation quotes.
 */
const analyzeUpdate = async (updateText) => {
  try {
    const prompt = `Analyze this team member's daily update and return ONLY a valid JSON object with no extra text:
{
  "sentiment": "positive" or "neutral" or "negative",
  "summary": "one sentence summary of what they did",
  "hasBlocker": true or false,
  "blockerText": "describe the blocker or empty string",
  "encouragement": "one short motivational line for the team member"
}
Update: ${updateText}`;

    return await getGroqJsonResponse(prompt);
  } catch (error) {
    console.error('Error calling analyzeUpdate via Groq:', error.message);
    // Return standard fallback
    return {
      sentiment: 'neutral',
      summary: 'Status update submitted.',
      hasBlocker: false,
      blockerText: '',
      encouragement: 'Keep up the good work and push towards your goals!'
    };
  }
};

/**
 * FUNCTION 2 — generateTeamSummary(allUpdates)
 * Summarizes all accomplishments, mood, top achievements, and manager actions.
 */
const generateTeamSummary = async (allUpdates) => {
  try {
    const prompt = `You are a team manager assistant. Here are today's team updates:
${JSON.stringify(allUpdates)}

Return ONLY a valid JSON object:
{
  "overallMood": "Healthy" or "Mixed" or "Needs Attention",
  "summary": "2-3 sentence summary of what the team accomplished today",
  "topAchievement": "best thing the team did today",
  "mainBlocker": "biggest blocker if any or none",
  "suggestion": "one actionable suggestion for the manager"
}`;

    return await getGroqJsonResponse(prompt);
  } catch (error) {
    console.error('Error calling generateTeamSummary via Groq:', error.message);
    return {
      overallMood: 'Mixed',
      summary: 'The team completed daily updates. No automated AI summaries could be generated at this time.',
      topAchievement: 'Completed routine daily updates.',
      mainBlocker: 'None reported.',
      suggestion: 'Review team updates manually on the feed.'
    };
  }
};

/**
 * FUNCTION 3 — getSmartSuggestion(updateHistory)
 * Evaluates the last 3 updates of a member to identify work trends and coaching opportunities.
 */
const getSmartSuggestion = async (updateHistory) => {
  try {
    const prompt = `Based on these recent updates from a team member:
${JSON.stringify(updateHistory)}

Return ONLY a valid JSON:
{
  "trend": "improving" or "stable" or "declining",
  "pattern": "one sentence about their work pattern",
  "suggestion": "one helpful suggestion for this member"
}`;

    return await getGroqJsonResponse(prompt);
  } catch (error) {
    console.error('Error calling getSmartSuggestion via Groq:', error.message);
    return {
      trend: 'stable',
      pattern: 'Consistently reporting daily status.',
      suggestion: 'Encourage them to maintain this consistency and check in if blockers arise.'
    };
  }
};

module.exports = {
  analyzeUpdate,
  generateTeamSummary,
  getSmartSuggestion
};
