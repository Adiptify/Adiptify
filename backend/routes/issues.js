import express from "express";
import { auth } from "../middleware/auth.js";
import IssueReport from "../models/IssueReport.js";

const router = express.Router();
router.post("/report-issue", auth, async (req, res) => {
  const { panel, section, summary, details } = req.body || {};
  if (!summary || !details || !panel) return res.status(400).json({ error: 'Summary, details, and panel are required.' });
  await IssueReport.create({
    reportedBy: req.user?._id,
    userName: req.user?.name,
    role: req.user?.role,
    panel, section, summary, details, status: 'open',
    createdAt: new Date()
  });
  res.json({ ok:true });
});
export default router;
