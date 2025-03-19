const express = require("express");
const { 
    addQuizQuestion, 
    getAllQuizzes, 
    getAllQuizIds, // ✅ New route to get only quiz IDs
    editQuizQuestion,  
    deleteQuizQuestion 
} = require("../controllers/quizController");

const router = express.Router();

// ✅ Route to add a quiz question
router.post("/add", addQuizQuestion);

// ✅ Route to get all quiz questions
router.get("/get", getAllQuizzes);

// ✅ Route to get all quiz IDs only
router.get("/ids", getAllQuizIds); // New endpoint for quiz IDs


// ✅ Route to edit/update a quiz question
router.put("/edit/:id", editQuizQuestion);

// ✅ Route to delete a quiz question
router.delete("/delete/:id", deleteQuizQuestion);

module.exports = router;
