import Item from "../models/Item.js";
import { generateQuestionsFromTopic } from "./ollamaService.js";
import GeneratedQuiz from "../models/GeneratedQuiz.js";

export async function selectItems({ userId, sessionContext, limit = 6 }) {
  const topics = sessionContext?.requestedTopics || [];
  const mode = sessionContext?.mode || "formative";
  const requestedDifficulty = sessionContext?.difficulty || [];

  // Use requested difficulty if provided, otherwise map mode to difficulty buckets
  const difficultyBuckets = requestedDifficulty.length ? requestedDifficulty : 
    (mode === "diagnostic" ? [1, 2, 3] : mode === "summative" ? [3, 4, 5] : [2, 3]);

  const query = {
    topics: topics.length ? { $in: topics } : { $exists: true },
    difficulty: { $in: difficultyBuckets },
  };
  
  let items = await Item.find(query).limit(limit).lean();
  
  // If not enough items, try to find published generated quizzes for this topic
  if (items.length < limit && topics.length > 0) {
    const topic = topics[0];
    const generated = await GeneratedQuiz.findOne({
      topic,
      status: "published",
      linkedItemIds: { $exists: true, $ne: [] },
    }).lean();
    
    if (generated && generated.linkedItemIds) {
      const generatedItems = await Item.find({
        _id: { $in: generated.linkedItemIds },
        difficulty: { $in: difficultyBuckets },
      }).limit(limit - items.length).lean();
      items = [...items, ...generatedItems];
    }
  }
  
  // If still not enough, generate new questions (but don't wait if it's async)
  if (items.length < limit && topics.length > 0) {
    const topic = topics[0];
    const levels = { easy: 0, medium: 0, hard: 0 };
    difficultyBuckets.forEach(d => {
      if (d <= 2) levels.easy++;
      else if (d <= 3) levels.medium++;
      else levels.hard++;
    });
    
    try {
      const { parsedItems } = await generateQuestionsFromTopic(topic, { levels }, userId);
      if (parsedItems && parsedItems.length > 0) {
        // Save to Item collection
        const newItems = await Item.insertMany(
          parsedItems.slice(0, limit - items.length).map(p => ({
            type: p.type || "mcq",
            question: p.question,
            choices: p.choices || [],
            answer: p.answer,
            difficulty: p.difficulty,
            bloom: p.bloom,
            topics: [topic],
            skills: p.skills || [],
            hints: p.hints || [],
            explanation: p.explanation || "",
            createdBy: userId,
            seedId: p.id,
            aiGenerated: true,
          }))
        );
        items = [...items, ...newItems.map(i => i.toObject())];
      }
    } catch (e) {
      console.error("Failed to generate questions:", e);
    }
  }
  
  return {
    itemIds: items.map((i) => i._id),
    metadata: { reason: "rules_selection_with_ai_fallback", mode, topics, difficultyBuckets },
  };
}

export default { selectItems };


