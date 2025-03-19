const express = require("express");
const { submitQuiz, getUserScores, getAllScores } = require("../controllers/scoreController");

const router = express.Router();

// ✅ Route to submit quiz answers
router.post("/submit", submitQuiz);

// ✅ Route to get scores of a specific user
router.get("/:userId", getUserScores);

// ✅ Route to get all scores (Leaderboard)
router.get("/all", getAllScores);

module.exports = router;
