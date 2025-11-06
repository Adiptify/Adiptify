import AILog from '../models/AILog.js';
export async function logAILLM({ userId, userName, role, endpoint, params, status, error, tokens, model, request, response }) {
  try {
    await AILog.create({
      userId,
      userName,
      role,
      endpoint,
      params,
      status,
      error,
      tokens,
      model,
      request: typeof request === 'string' ? request.slice(0, 1200) : JSON.stringify(request).slice(0, 1200),
      response: typeof response === 'string' ? response.slice(0, 1500) : JSON.stringify(response).slice(0, 1500),
      timestamp: new Date(),
    });
  } catch (e) { /* logging error; do not throw */ }
}
