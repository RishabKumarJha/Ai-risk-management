const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 60000,
});

const getRiskFromDetails = (projectType, complexity, teamSize, budget, priority, experience) => {
  let score = 0;
  if (complexity > 7) score += 3;
  else if (complexity > 5) score += 2;
  else score += 1;
  if (teamSize < 5) score += 2;
  else if (teamSize > 20) score += 2;
  else score += 1;
  if (budget < 100000) score += 3;
  else if (budget < 500000) score += 2;
  else score += 1;
  if (priority === 'Critical') score += 3;
  else if (priority === 'High') score += 2;
  else score += 1;
  if (experience === 'Junior') score += 3;
  else if (experience === 'Mixed') score += 2;
  else score += 1;
  if (projectType === 'Healthcare' || projectType === 'R&D') score += 2;
  else if (projectType === 'Construction') score += 1;
  if (score >= 14) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 6) return 'Medium';
  return 'Low';
};

router.post('/predict', auth, async (req, res) => {
  try {
    const {
      projectName,
      projectType,
      teamSize,
      estimatedTimelineMonths,
      complexityScore,
      methodologyUsed,
      teamExperienceLevel,
      budget,
      priorityLevel,
      projectManagerExperience,
    } = req.body;

    // Try Groq for the reason only
    let riskReason = '';
    const riskLevel = getRiskFromDetails(
      projectType,
      Number(complexityScore),
      Number(teamSize),
      Number(budget),
      priorityLevel,
      teamExperienceLevel
    );

    try {
      const completion = await groq.chat.completions.create({
        model: 'allam-2-7b',
        max_tokens: 150,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: `/no_think Give a 2 sentence explanation for why a ${projectType} project named "${projectName}" with ${teamSize} people, ${teamExperienceLevel} experience, $${budget} budget, ${complexityScore}/10 complexity, ${estimatedTimelineMonths} months timeline and ${priorityLevel} priority has ${riskLevel} risk. Be specific and direct.`,
          },
        ],
      });

            const text = completion.choices[0].message.content || '';
      // Remove think blocks completely
      let withoutThink = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      // If think block wasn't closed, take everything after last </think> or use fallback
      if (withoutThink.length < 10) {
        const afterThink = text.split('</think>').pop().trim();
        withoutThink = afterThink.length > 10 ? afterThink : '';
      }
      // Clean up any remaining tags
      withoutThink = withoutThink.replace(/<[^>]*>/g, '').trim();
      riskReason = withoutThink.length > 10
        ? withoutThink
        : generateFallbackReason(projectType, complexityScore, teamSize, budget, priorityLevel, teamExperienceLevel, riskLevel);

    } catch (groqErr) {
      console.log('Groq reason failed, using fallback:', groqErr.message);
      riskReason = generateFallbackReason(projectType, complexityScore, teamSize, budget, priorityLevel, teamExperienceLevel, riskLevel);
    }

    res.json({ riskLevel, riskReason });

  } catch (error) {
    console.error('Groq route error:', error.message);
    res.status(500).json({ message: 'Prediction failed', error: error.message });
  }
});

function generateFallbackReason(projectType, complexity, teamSize, budget, priority, experience, riskLevel) {
  const reasons = [];
  if (Number(complexity) > 7) reasons.push('high technical complexity');
  if (Number(teamSize) < 5) reasons.push('small team size');
  if (Number(budget) < 100000) reasons.push('limited budget');
  if (priority === 'Critical') reasons.push('critical priority pressure');
  if (experience === 'Junior') reasons.push('junior team experience');
  if (projectType === 'Healthcare') reasons.push('strict healthcare regulations');
  if (projectType === 'R&D') reasons.push('high research uncertainty');
  if (reasons.length === 0) reasons.push('balanced project parameters');
  return `This ${projectType} project is ${riskLevel} risk due to ${reasons.slice(0, 3).join(', ')}. Careful monitoring and risk mitigation strategies are recommended throughout the project lifecycle.`;
}

module.exports = router;