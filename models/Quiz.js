const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Quiz Title
  questions: [
    {
      question: { type: String, required: true }, // The question text
      questionType: { 
        type: String, 
        enum: ["single-choice", "multiple-choice", "true-false"], 
        required: true 
      },
      options: { 
        type: [String], 
        required: true, 
        validate: {
          validator: function (val) {
            if (this.questionType === "true-false") {
              return Array.isArray(val) && val.length === 2 && val.includes("True") && val.includes("False");
            }
            return Array.isArray(val) && val.length >= 2;
          },
          message: "Invalid options: Must have at least 2 choices, or 'True' and 'False' for true/false questions."
        }
      },
      correctAnswer: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true, 
        validate: {
          validator: function (val) {
            if (this.questionType === "single-choice") {
              return typeof val === "string" && val.length > 0 && this.options.includes(val);
            }
            if (this.questionType === "multiple-choice") {
              return Array.isArray(val) && val.length > 0 && val.every(answer => this.options.includes(answer));
            }
            if (this.questionType === "true-false") {
              return typeof val === "string" && (val === "True" || val === "False") && this.options.includes(val);
            }
            return false;
          },
          message: "Invalid correctAnswer: Ensure it's properly formatted based on question type."
        }
      }
    }
  ]
});

// Export the model
module.exports = mongoose.model("Quiz", QuizSchema);
