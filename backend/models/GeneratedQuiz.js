import mongoose from "mongoose";

const generatedQuizSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    prompt: { type: String, required: true },
    sourceModel: { type: String, default: "" },
    modelVersion: { type: String, default: "" },
    seedId: { type: String, index: true },
    levels: {
      type: new mongoose.Schema(
        {
          easy: { type: Number, default: 0 },
          medium: { type: Number, default: 0 },
          hard: { type: Number, default: 0 },
        },
        { _id: false }
      ),
      default: undefined,
    },
    items: { type: Array, default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    linkedItemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rawResponse: { type: mongoose.Schema.Types.Mixed },
    parsedItems: { type: Array, default: [] },
    validationResult: { type: mongoose.Schema.Types.Mixed },
    notes: { type: String },
    publishedAt: { type: Date },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const GeneratedQuiz = mongoose.model("GeneratedQuiz", generatedQuizSchema);
export default GeneratedQuiz;


