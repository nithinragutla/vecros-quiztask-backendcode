const mongoose = require("mongoose");
const Score = require("../models/Score");
const Quiz = require("../models/Quiz");
const UserNew = require("../models/UserNew"); // Ensure correct import

// ✅ Submit Quiz and Calculate Score
const submitQuiz = async (req, res) => {
  try {
    const { userId, quizTitle, selectedAnswers } = req.body;

    if (!userId || !quizTitle || !Array.isArray(selectedAnswers)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    // Find the quiz by title
    const quiz = await Quiz.findOne({ title: quizTitle }).populate("questions");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let scoreValue = 0;
    const feedback = {}; // Object to store feedback for each question

    selectedAnswers.forEach(({ questionId, selectedAnswer }) => {
      const question = quiz.questions.find(q => q._id.toString() === String(questionId));

      if (question && question.correctAnswer) {
        const correctAnswer = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.map(ans => ans?.toLowerCase().trim())
          : [question.correctAnswer?.toLowerCase().trim()];

        const userResponse = Array.isArray(selectedAnswer)
          ? selectedAnswer.map(ans => ans?.toLowerCase().trim())
          : [selectedAnswer?.toLowerCase().trim()];

        if (JSON.stringify(correctAnswer.sort()) === JSON.stringify(userResponse.sort())) {
          scoreValue++;
          feedback[questionId] = "✅ Your answer is correct!";
        } else {
          feedback[questionId] = `❌ Your answer is wrong! The correct answer is: ${question.correctAnswer}`;
        }
      }
    });

    // Save the score to the database
    const newScore = await Score.create({
      user: userId,
      quizId: quiz._id,
      score: scoreValue,
    });

    // Send the response back with score and feedback
    res.json({ message: "Quiz submitted successfully", score: scoreValue, feedback });
  } catch (error) {
    res.status(500).json({ message: `Error submitting quiz: ${error.message}` });
  }
};






// ✅ Fetch scores for a specific user
const getUserScores = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId) && userId !== "all") {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const scores = await Score.find(userId === "all" ? {} : { user: userId })
      .populate("user", "username email")
      .populate("quizId", "title")
      .lean();

    if (!scores.length) return res.status(404).json({ message: "No scores found" });

    res.json(scores);
  } catch (error) {
    console.error("❌ Error fetching user scores:", error.message);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

// ✅ Fetch all scores (Leaderboard)
const getAllScores = async (req, res) => {
  try {
    console.log("Fetching all scores...");

    const scores = await Score.find()
      .populate({ path: "user", select: "username _id" })
      .populate({ path: "quizId", select: "title _id" })
      .lean();

    if (!scores.length) {
      console.log("No scores found.");
      return res.status(404).json({ message: "No scores found" });
    }

    res.json(scores);
  } catch (error) {
    console.error("❌ Error fetching all scores:", error.message);
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

module.exports = { submitQuiz, getUserScores, getAllScores };
