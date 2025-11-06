import User from "../models/User.js";

const DEFAULT_ALPHA = 0.2;

export async function updateMastery(userId, topic, item, isCorrect, timeTakenMs) {
  const user = await User.findById(userId);
  if (!user) return null;

  const topics = user.learnerProfile?.topics || new Map();
  const current = topics.get(topic) || { mastery: 0, attempts: 0, streak: 0, timeOnTask: 0 };

  const score = isCorrect ? 1 : 0;
  const alpha = DEFAULT_ALPHA;
  const masteryNew = alpha * score + (1 - alpha) * (current.mastery || 0);

  const next = {
    mastery: masteryNew,
    attempts: (current.attempts || 0) + 1,
    streak: isCorrect ? (current.streak || 0) + 1 : 0,
    timeOnTask: (current.timeOnTask || 0) + (timeTakenMs || 0),
  };

  topics.set(topic, next);
  user.learnerProfile.topics = topics;

  // Basic remediation trigger example (store minimal audit in user for now)
  const recentStruggle = !isCorrect && (current.attempts || 0) >= 1 && next.streak === 0;
  if (recentStruggle) {
    user.learnerProfile.lastRemediationTopic = topic;
    user.learnerProfile.lastRemediationAt = new Date();
  }

  await user.save();
  return next;
}

export default { updateMastery };


