import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    mode: { type: String, enum: ["diagnostic", "formative", "summative"], default: "formative" },
    itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    currentIndex: { type: Number, default: 0 },
    startedAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date },
    score: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed },
    timeLimit: { type: Number },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

export const QuizSession = mongoose.model("QuizSession", quizSessionSchema);
export default QuizSession;


