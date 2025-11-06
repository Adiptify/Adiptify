import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Item from "../models/Item.js";

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
  const dbName = process.env.MONGO_DB || "nimbus";
  await mongoose.connect(uri, { dbName });

  console.log("Seeding users...");
  const passwordHash = await bcrypt.hash("password123", 10);
  const [instructor, admin] = await User.create([
    { name: "Instructor One", email: "instructor@example.com", passwordHash, role: "instructor" },
    { name: "Admin User", email: "admin@example.com", passwordHash, role: "admin" },
  ]);

  console.log("Seeding items...");
  const sampleItems = [
    {
      type: "mcq",
      question: "What is 2 + 2?",
      choices: ["3", "4", "5", "6"],
      answer: "4",
      difficulty: 1,
      bloom: "remember",
      topics: ["Arithmetic"],
      aiGenerated: false,
    },
    {
      type: "mcq",
      question: "Solve for x: 2x + 3 = 7",
      choices: ["x=1", "x=2", "x=3", "x=4"],
      answer: "x=2",
      difficulty: 2,
      bloom: "apply",
      topics: ["Algebra:Linear Equations"],
      aiGenerated: false,
    },
  ];
  await Item.insertMany(sampleItems.map((i) => ({ ...i, createdBy: instructor._id })));

  console.log("Done.");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


