import express from "express";
import { auth } from "../middleware/auth.js";
import GeneratedQuiz from "../models/GeneratedQuiz.js";
import QuizSession from "../models/QuizSession.js";
import Attempt from "../models/Attempt.js";
import Item from "../models/Item.js";

const router = express.Router();

// GET /api/quizzes?status=published&limit=20
router.get("/", auth, async (req, res) => {
  const { status, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  const docs = await GeneratedQuiz.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 20, 100))
    .select("topic status createdAt linkedItemIds levels")
    .lean();
  return res.json(docs);
});

// GET /api/quizzes/:id
router.get("/:id", auth, async (req, res) => {
  const doc = await GeneratedQuiz.findById(req.params.id).lean();
  if (!doc) return res.status(404).json({ error: "Not found" });
  return res.json(doc);
});

export default router;

// Compatibility: POST /api/quizzes/submit -> same as /api/quiz/answer
router.post("/submit", auth, async (req, res) => {
  const { sessionId, answer, timeTakenMs = 0 } = req.body || {};
  const session = await QuizSession.findById(sessionId);
  if (!session || String(session.user) !== String(req.user._id)) return res.status(404).json({ error: "Session not found" });
  if (session.status !== "active") return res.status(400).json({ error: "Session not active" });

  const itemId = session.itemIds[session.currentIndex];
  const item = await Item.findById(itemId).lean();
  const isCorrect = String(answer).trim() === String(item?.answer || "").trim();

  await Attempt.create({
    user: req.user._id,
    item: itemId,
    session: session._id,
    isCorrect,
    userAnswer: answer,
    timeTakenMs,
  });

  session.currentIndex = Math.min(session.currentIndex + 1, session.itemIds.length);
  await session.save();

  return res.json({ isCorrect, correctAnswer: item?.answer, nextIndex: session.currentIndex });
});


