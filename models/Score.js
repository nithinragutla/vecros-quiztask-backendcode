const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "UserNew", required: true },  
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  score: { type: Number, required: true, min: 0 }, // ✅ Ensuring valid scores
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Score", ScoreSchema);

