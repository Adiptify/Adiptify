import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["mcq", "short", "code"], required: true },
    questionType: { type: String },
    question: { type: String, required: true },
    choices: { type: [String], default: [] },
    answer: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 5, required: true },
    bloom: { type: String, enum: ["remember", "understand", "apply", "analyze", "evaluate", "create"], required: true },
    cognitiveLevel: { type: String },
    topics: { type: [String], index: true },
    skills: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    hints: { type: [String], default: [] },
    explanation: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    seedId: { type: String },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

itemSchema.index({ topics: 1 });
itemSchema.index({ difficulty: 1 });

export const Item = mongoose.model("Item", itemSchema);
export default Item;


