const mongoose = require("mongoose");
const Score = require("../models/Score");
const Quiz = require("../models/Quiz");
const UserNew = require("../models/UserNew"); // ✅ Ensure correct import

// ✅ Submit Quiz and Calculate Score
const submitQuiz = async (req, res) => {
  try {
    console.log("🛠️ Received request body:", req.body);

    const { userId, quizTitle, selectedAnswers } = req.body;

    if (!userId || !quizTitle || !selectedAnswers) {
      console.error("❌ Missing required fields:", { userId, quizTitle, selectedAnswers });
      return res.status(400).json({ message: "Missing required fields." });
    }

    // ✅ Fetch the quiz
    const quiz = await Quiz.findOne({ title: quizTitle });
    if (!quiz) {
      console.error("❌ Quiz not found:", quizTitle);
      return res.status(404).json({ message: "Quiz not found." });
    }
    console.log("✅ Quiz found:", quiz._id);

    // ✅ Fetch the user
    const user = await UserNew.findById(userId);
    if (!user) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ message: "User not found." });
    }
    console.log("✅ User found:", user._id);

    let newScore = 0;
    let feedback = {};
    let correctAnswers = []; // ✅ Store correct answers to return in response

    // ✅ Calculate score & collect correct answers
    quiz.questions.forEach((question) => {
      const userAnswer = selectedAnswers.find((ans) => ans.questionId === question._id.toString());

      const correctAnswerList = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer];

      correctAnswers.push({ questionId: question._id, correctAnswer: correctAnswerList });

      if (userAnswer) {
        if (Array.isArray(userAnswer.selectedAnswer)) {
          if (JSON.stringify(userAnswer.selectedAnswer.sort()) === JSON.stringify(correctAnswerList.sort())) {
            newScore += 1;
            feedback[question._id] = "✅ Correct!";
          } else {
            feedback[question._id] = "❌ Incorrect. Try again!";
          }
        } else {
          if (userAnswer.selectedAnswer === correctAnswerList[0]) {
            newScore += 1;
            feedback[question._id] = "✅ Correct!";
          } else {
            feedback[question._id] = `❌ Incorrect. The correct answer is: ${correctAnswerList[0]}`;
          }
        }
      }
    });

    console.log("🔢 Calculated Score:", newScore);

    // ✅ Check if a score entry already exists
    let existingScore = await Score.findOne({ user: user._id, quizId: quiz._id });

    if (existingScore) {
      console.log("📌 Updating existing score:", existingScore._id);
      existingScore.score = newScore;
      await existingScore.save();
    } else {
      console.log("🆕 Creating new score entry");
      existingScore = new Score({
        user: user._id,
        quizId: quiz._id,
        score: newScore,
      });
      await existingScore.save();
    }

    console.log("✅ Score saved successfully:", existingScore);

    // ✅ Return correct answers along with score & feedback
    res.json({ score: existingScore.score, feedback, correctAnswers });
  } catch (error) {
    console.error("❌ Server error during quiz submission:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
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
