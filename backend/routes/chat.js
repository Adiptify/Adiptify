import express from "express";
import ollama from "ollama";
import { auth } from "../middleware/auth.js";
import { config } from "../config/index.js";
import { logAILLM } from "../middleware/aiLogger.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { message, context = {} } = req.body || {};
  const messages = [
    { role: 'user', content: message }
  ];
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  let aiResponse = '', error = null, status = 'success', tokens = 0;
  try {
    const reply = await ollama.chat({ model: config.ollamaModel, messages, stream: true });
    for await (const part of reply) {
      if (part.message && part.message.content) {
        aiResponse += part.message.content;
        res.write(part.message.content);
        res.flush && res.flush();
      }
      if (part.eval_count) tokens += part.eval_count;
    }
    res.end();
  } catch (e) {
    status = 'error'; error = e.message; res.write('(AI failed: ' + e.message + ')'); res.end();
  }
  // Log outside streaming (OK for history analytics)
  logAILLM({
    userId: req.user?._id,
    userName: req.user?.name,
    role: req.user?.role,
    endpoint: '/api/chat',
    params: { message, context },
    status, error, tokens, model: config.ollamaModel, request: message, response: aiResponse
  });
});

export default router;


