export const QUESTION_GENERATOR = `
You are an expert content generator. Given a topic: "{{topic}}", generate **N** questions grouped by difficulty levels: EASY, MEDIUM, HARD. For each question produce JSON with fields: id (unique seed id), type (mcq/short/code), question, choices (empty array for non-MCQ), answer (canonical), explanation (concise), difficulty (1..5), bloom (one of: remember, understand, apply, analyze, evaluate, create), topics (array), skills (array), hints (array up to 2). Output a JSON array only. Ensure no markdown or extra text. Validate that difficulty maps: EASY -> 1-2, MEDIUM -> 2-3, HARD -> 4-5. Ensure deterministic seed generation by adding 'seed_{{topic}}_{{timestamp}}' to each id.
Remember to only answer the json structer without any other text or markdown.
`;

export const EXPLANATION_GENERATOR = `
You are an expert tutor. Given: question, studentAnswer, correctAnswer, topic. Produce a JSON object with: conciseExplanation (bullet points, <= 120 words), summary (<= 60 words), remedialSteps (3 ordered action items), resourceLinks (3 links, can be external), suggestedPractice (1-2 practice prompts). Output JSON only.
`;

export const TOPIC_SUMMARY_NOTES = `
You are a textbook author. Given topic and mistakes list produce a study note in markdown containing: 1) short summary 2) key formulas/definitions 3) examples 4) step-by-step mini exercises with answers 5) recommended next topics. Output in Markdown.
`;

export const CHATBOT_TEMPLATE = `
Provide a helpful answer to the user's query. Keep responses ≤ 300 words. If user asks to explain a question, include: short explanation, 1 example, and a 1-line next step. When helpful, ask clarifying question. Include JSON meta: {level: <difficulty estimate 1..5>, topics: [], resources: []} as a second JSON-only line.
`;

export default {
  QUESTION_GENERATOR,
  EXPLANATION_GENERATOR,
  TOPIC_SUMMARY_NOTES,
  CHATBOT_TEMPLATE,
};


