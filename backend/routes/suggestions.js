const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 60000 });

router.post('/generate', auth, async (req, res) => {
  try {
    const {
      projectName, projectType, teamSize, estimatedTimelineMonths,
      complexityScore, methodologyUsed, teamExperienceLevel,
      budget, priorityLevel, projectManagerExperience, riskLevel
    } = req.body;

    let suggestions = [];

    try {
      const completion = await groq.chat.completions.create({
        model: 'allam-2-7b',
        max_tokens: 500,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: `You are a project risk management consultant. A ${projectType} project has been assessed as ${riskLevel} risk. Team: ${teamSize} people with ${teamExperienceLevel} experience. Timeline: ${estimatedTimelineMonths} months. Budget: $${budget}. Complexity: ${complexityScore}/10. Methodology: ${methodologyUsed}. PM: ${projectManagerExperience}. Give 5 specific actionable real-world suggestions to manage and reduce this project risk. Practical advice a project manager can implement. Format as 5 suggestions each starting with a number and emoji. Each 1-2 sentences.`
        }]
      });

      const text = completion.choices[0].message.content || '';
      const withoutThink = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      const afterThink = withoutThink.length > 10 ? withoutThink : text.split('</think>').pop().trim();
      const cleaned = afterThink.replace(/<[^>]*>/g, '').trim();

      if (cleaned.length > 10) {
        const lines = cleaned.split('\n').filter(l => l.trim().length > 10);
        suggestions = lines.slice(0, 5).map(l => l.replace(/^\d+\.\s*/, '').trim());
      }
    } catch (groqErr) {
      console.log('Groq suggestions failed:', groqErr.message);
    }

    if (suggestions.length === 0) {
      suggestions = [
        '📋 Break the project into smaller milestones with clear deliverables and deadlines to make progress measurable.',
        '🤝 Schedule regular stakeholder meetings every 2 weeks to gather feedback and avoid last-minute changes.',
        '📊 Maintain a risk register with identified risks, owners, and mitigation plans updated weekly.',
        '🔄 Implement daily standups to catch blockers early and maintain team alignment throughout.',
        '🛡️ Build a contingency buffer of at least 15% in both time and budget for unexpected challenges.',
      ];
    }

    res.json({ suggestions });

  } catch (error) {
    console.error('Suggestions error:', error.message);
    res.status(500).json({ message: 'Failed to generate suggestions' });
  }
});

module.exports = router;