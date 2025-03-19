const Quiz = require("../models/Quiz");
const mongoose = require("mongoose");


// ✅ Create a new quiz question (for multiple questions at once)
const addQuizQuestion = async (req, res) => {
  try {
    const { title, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Title and questions are required" });
    }

    // Validate each question before saving
    for (const question of questions) {
      if (!["single-choice", "multiple-choice", "true-false"].includes(question.questionType)) {
        return res.status(400).json({ message: `Invalid questionType: ${question.questionType}` });
      }

      if (question.questionType === "single-choice" && typeof question.correctAnswer !== "string") {
        return res.status(400).json({ message: "Invalid correctAnswer for single-choice question" });
      }
      
      if (question.questionType === "multiple-choice" && !Array.isArray(question.correctAnswer)) {
        return res.status(400).json({ message: "Invalid correctAnswer for multiple-choice question" });
      }
      
      if (question.questionType === "true-false" && !["True", "False"].includes(question.correctAnswer)) {
        return res.status(400).json({ message: "Invalid correctAnswer for true-false question" });
      }
    }

    // Find existing quiz by title
    const existingQuiz = await Quiz.findOne({ title });

    if (existingQuiz) {
      // If quiz exists, append new questions to the existing quiz
      existingQuiz.questions.push(...questions);
      await existingQuiz.save();
      return res.status(200).json({ message: "Quiz questions added successfully", quiz: existingQuiz });
    } else {
      // If quiz doesn't exist, create a new quiz with the questions
      const newQuiz = new Quiz({ title, questions });
      await newQuiz.save();
      return res.status(201).json({ message: "Quiz created and questions added successfully", quiz: newQuiz });
    }
  } catch (error) {
    console.error("❌ Error adding quiz question:", error.message);
    res.status(500).json({ message: `Error adding quiz: ${error.message}` });
  }
};

// ✅ Get all quiz questions
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes); // Ensure it returns an array
  } catch (error) {
    console.error("❌ Error fetching quizzes:", error.message);
    res.status(500).json({ message: "Error fetching quizzes" });
  }
};



// ✅ Get all quiz IDs only
const getAllQuizIds = async (req, res) => {
  try {
    const quizIds = await Quiz.find({}, "_id"); // Fetch only the `_id` field
    res.json(quizIds);
  } catch (error) {
    console.error("❌ Error fetching quiz IDs:", error.message);
    res.status(500).json({ message: "Error fetching quiz IDs" });
  }
};

// ✅ Update (Edit) Quiz Question
const editQuizQuestion = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL
    const updatedData = req.body; // Get the updated data from the body

    // Log the received ID and data for debugging
    console.log("Received ID:", id);
    console.log("Received data:", updatedData);

    // Ensure the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    // Find the quiz by ID
    const updatedQuiz = await Quiz.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz question not found" });
    }

    // Respond with the updated quiz
    res.json({ message: "Quiz question updated successfully", updatedQuiz });
  } catch (error) {
    console.error("❌ Error updating quiz question:", error.message);
    res.status(500).json({ message: `Error updating quiz question: ${error.message}` });
  }
};




// ✅ Delete Quiz Question
const deleteQuizQuestion = async (req, res) => {
  const questionId = req.params.id;

  try {
    console.log("Attempting to delete question with ID:", questionId);

    const quiz = await Quiz.findOne({ "questions._id": questionId });

    if (!quiz) {
      console.log("Quiz question not found.");
      return res.status(404).json({ message: 'Quiz question not found' });
    }

    // Remove the question
    quiz.questions = quiz.questions.filter((question) => question._id.toString() !== questionId);

    await quiz.save();
    console.log("Successfully deleted question.");
    return res.status(200).json({ message: 'Question deleted successfully' });

  } catch (error) {
    // Log the error in detail
    console.error("Error during deletion:", error);
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};


const getQuizByTitle = async (req, res) => {
  
  try {
    const { title } = req.params;

    const quiz = await Quiz.findOne({ title });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    console.error("❌ Error fetching quiz:", error.message);
    res.status(500).json({ message: "Error fetching quiz" });
  }
};




// ✅ Export all controllers
module.exports = { 
  addQuizQuestion, 
  getAllQuizzes, 
  getAllQuizIds, // ✅ Exporting new function
  editQuizQuestion, 
  deleteQuizQuestion ,
  getQuizByTitle
};
