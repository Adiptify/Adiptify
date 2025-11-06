import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", index: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: "QuizSession", index: true },
    isCorrect: { type: Boolean, required: true },
    userAnswer: { type: String, default: "" },
    timeTakenMs: { type: Number, default: 0 },
    explanation: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

attemptSchema.index({ user: 1, item: 1 });

export const Attempt = mongoose.model("Attempt", attemptSchema);
export default Attempt;


