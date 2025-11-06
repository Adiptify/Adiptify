import ollama from 'ollama';
import GeneratedQuiz from "../models/GeneratedQuiz.js";
import { config } from "../config/index.js";

function normalizeDifficulty(d) {
  if (typeof d === "number") return Math.min(5, Math.max(1, d));
  const map = { easy: 2, medium: 3, hard: 4 };
  const key = String(d || "").toLowerCase();
  return map[key] || 3;
}

function normalizeBloom(cognitiveLevel, bloom) {
  const val = String(cognitiveLevel || bloom || "apply").toLowerCase();
  if (["remember","understand","apply","analyze","evaluate","create"].includes(val)) return val;
  // basic mapping
  if (val.includes("analy")) return "analyze";
  if (val.includes("eval")) return "evaluate";
  if (val.includes("creat")) return "create";
  if (val.includes("under")) return "understand";
  if (val.includes("remem")) return "remember";
  return "apply";
}

function validateItem(raw) {
  const difficultyOk = Number.isInteger(raw.difficulty) && raw.difficulty >= 1 && raw.difficulty <= 5;
  const bloomOk = ["remember","understand","apply","analyze","evaluate","create"].includes(raw.bloom);
  return !!(raw.id && raw.type && raw.question && raw.answer && difficultyOk && bloomOk);
}

function coerceArray(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.items)) return response.items;
  return [];
}

export function parseItems(resp) {
  const arr = coerceArray(resp);
  const mapped = arr.map((r) => {
    // Support both schemas
    const type = r.type || (r.options ? "mcq" : "short");
    const choices = r.choices || r.options || [];
    const answer = r.answer ?? (Number.isInteger(r.correctIndex) && choices[r.correctIndex] !== undefined ? String(choices[r.correctIndex]) : "");
    const difficulty = normalizeDifficulty(r.difficulty);
    const bloom = normalizeBloom(r.cognitiveLevel, r.bloom);
    return {
      id: r.id,
      type,
      questionType: r.type || r.questionType || type,
      question: r.question,
      choices,
      answer,
      explanation: r.explanation || "",
      difficulty,
      bloom,
      cognitiveLevel: r.cognitiveLevel || bloom,
      topics: r.topics || (r.topic ? [r.topic] : []),
      skills: r.skills || [],
      hints: r.hints ? (Array.isArray(r.hints) ? r.hints : [r.hints]) : [],
    };
  });
  return mapped.filter(validateItem);
}

export async function generateQuestionsFromTopic(topic, options = {}, userId = null) {
  const { levels = { easy: 2, medium: 2, hard: 2 } } = options;
  const timestamp = Date.now();
  // Build the prompt according to provided template (import if needed)
  const reqPrompt = `You are an expert content generator. Given a topic: "${topic}", generate **N** questions grouped by difficulty levels: EASY, MEDIUM, HARD. For each question produce JSON with fields: id (unique seed id), type (mcq/short/code), question, choices (empty array for non-MCQ), answer (canonical), explanation (concise), difficulty (1..5), bloom (one of: remember, understand, apply, analyze, evaluate, create), topics (array), skills (array), hints (array up to 2). Output a JSON array only. Ensure no markdown or extra text. Validate that difficulty maps: EASY -> 1-2, MEDIUM -> 2-3, HARD -> 4-5. Ensure deterministic seed generation by adding 'seed_${topic.replace(/\s+/g,'_')}_${timestamp}' to each id.`;
  let rawResponse = null;
  let aiOutput = [];
  try {
    // Use ollama.generate, cloud model
    const response = await ollama.generate({
      model: config.ollamaModel,
      prompt: reqPrompt,
      format: 'json',
      stream: false,
    });
    rawResponse = response.response || response;
    try {
      aiOutput = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
    } catch (e) { aiOutput = []; }
  } catch (e) {
    aiOutput = [];
  }
  // Inject seed ids if missing
  const withSeeds = Array.isArray(aiOutput) ? aiOutput.map((r, i) => ({
    ...r,
    id: r.id || `seed_${topic.replace(/\s+/g,'_')}_${timestamp}_${i}`,
  })) : [];
  const parsedItems = parseItems(withSeeds);

  const created = await GeneratedQuiz.create({
    topic,
    prompt: reqPrompt,
    sourceModel: config.ollamaModel,
    seedId: `seed_${topic.replace(/\s+/g,'_')}_${timestamp}`,
    items: withSeeds,
    rawResponse,
    parsedItems,
    createdBy: userId || undefined,
    status: "draft",
  });
  return { quiz: created, parsedItems };
}

export const __test__ = { parseItems, validateItem };

export default { generateQuestionsFromTopic, parseItems };


