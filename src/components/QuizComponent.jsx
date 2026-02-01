import React, { useState } from 'react';
import '../styles/QuizComponent.css';

const QuizComponent = ({ onPageChange }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const questions = [
    {
      id: 1,
      question: "Does your child cough a lot?",
      options: [
        "No cough at all",
        "A little cough sometimes",
        "Coughing a lot",
        "Really bad cough with gunk or phlegm"
      ]
    },
    {
      id: 2,
      question: "Is your child having trouble breathing?",
      options: [
        "Breathing is normal",
        "Breathing a little faster than usual",
        "Breathing hard or wheezy",
        "Breathing very fast or struggling"
      ]
    },
    {
      id: 3,
      question: "Does your child have a fever?",
      options: [
        "No fever",
        "Slightly warm",
        "Hot and shivery",
        "Very high fever"
      ]
    },
    {
      id: 4,
      question: "Does your child complain of chest or tummy pain, especially when coughing or breathing?",
      options: [
        "No pain",
        "A little discomfort",
        "Pain sometimes",
        "Pain is strong when breathing"
      ]
    },
    {
      id: 5,
      question: "Is your child very tired or sleepy?",
      options: [
        "Full of energy",
        "Slightly tired",
        "Tired most of the day",
        "Very sleepy and weak"
      ]
    },
    {
      id: 6,
      question: "Do your child's lips or fingers look blue?",
      options: [
        "Normal color",
        "Slightly pale",
        "Sometimes bluish",
        "Clearly blue"
      ]
    },
    {
      id: 7,
      question: "Is your child refusing to eat or drink?",
      options: [
        "Eating and drinking normally",
        "Eating a little less",
        "Refuses some food",
        "Refuses almost everything"
      ]
    },
    {
      id: 8,
      question: "Does your child seem dizzy or confused?",
      options: [
        "Feeling normal",
        "Slightly off",
        "Confused sometimes",
        "Very dizzy or confused"
      ]
    },
    {
      id: 9,
      question: "Does your child have a runny or stuffy nose?",
      options: [
        "Nose is clear",
        "Slight runny/stuffy nose",
        "Nose runny most of the time",
        "Very runny/stuffy"
      ]
    },
    {
      id: 10,
      question: "Is your child shivering or shaking?",
      options: [
        "Feeling fine",
        "Slight shivers",
        "Shivering sometimes",
        "Shivering a lot"
      ]
    },
    {
      id: 11,
      question: "Is your child crying more than usual, especially when it hurts to breathe?",
      options: [
        "Normal crying",
        "A little more than usual",
        "Crying often",
        "Crying a lot, can't calm"
      ]
    },
    {
      id: 12,
      question: "Is your child playing less or losing interest in toys?",
      options: [
        "Playing normally",
        "Plays a little less",
        "Plays very little",
        "Doesn't play at all"
      ]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const analyzeImages = () => {
    // Navigate to the analyze page using the parent component's page change handler
    onPageChange('analyze');
  };

  if (showResult) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <div className="quiz-header">
            <h1 className="quiz-title"> Thank You!</h1>
            <p className="quiz-description">
              Thank you for answering the assessment. Your responses have been recorded.
            </p>
          </div>

          <div className="quiz-actions">
            <button className="btn btn-primary" onClick={analyzeImages}>
               Analyze Images
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <div className="quiz-header">
          <h1 className="quiz-title">Child Respiratory Assessment</h1>
          <p className="quiz-description">
            This assessment helps identify possible signs of pneumonia in young children.
          </p>

          {/* Instruction Button */}
          <button
            className="instruction-btn"
            onClick={() => setShowInstructions(true)}
          >
            📘 How to find the Symptoms?
          </button>
        </div>

        <div className="progress-container">
          <div className="progress-info">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <h2 className="question-text">{currentQ.question}</h2>

        <div className="question-container">
          <div className="question-header">
            <span className="question-badge">Question {currentQuestion + 1}</span>
          </div>
          <h2 className="question-text">{currentQ.question}</h2>

          <div className="options-container">
            {currentQ.options.map((option, index) => (
              <label 
                key={index} 
                className={`option-label ${answers[currentQ.id] === option ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${currentQ.id}`}
                  value={option}
                  checked={answers[currentQ.id] === option}
                  onChange={() => handleAnswer(currentQ.id, option)}
                />
                <span className="option-text">{option}</span>
                <span className="option-check">
                  {answers[currentQ.id] === option && '✓'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="quiz-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNext}
            disabled={!answers[currentQ.id]}
          >
            {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'} →
          </button>
        </div>
      </div>

      {/* ================= INSTRUCTIONS MODAL ================= */}
      {showInstructions && (
        <div className="modal-overlay" onClick={() => setShowInstructions(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowInstructions(false)}>✖</button>

            <h2>Pneumonia Symptom Recognition Guide</h2>

            <p className="modal-warning">
              Always seek immediate medical attention if pneumonia is suspected.
            </p>

            <h3>Key Warning Signs (Emergency Care Required)</h3>
            <ul>
              <li>Difficulty breathing with chest retractions</li>
              <li>Grunting sounds during breathing</li>
              <li>Fast breathing (over 50/min for infants, over 40/min for children)</li>
              <li>Bluish lips, tongue, or face</li>
              <li>Severe lethargy or unresponsiveness</li>
              <li>Signs of dehydration</li>
            </ul>

            <h3>Common Symptoms</h3>
            <ul>
              <li>Persistent cough</li>
              <li>Fever (may be absent in newborns)</li>
              <li>Wheezing or nasal flaring</li>
              <li>Poor feeding or vomiting</li>
              <li>Irritability or reduced activity</li>
            </ul>

            <h3>Age-Specific Red Flags</h3>
            <ul>
              <li><strong>Under 3 months:</strong> poor feeding, apnea, low body temperature</li>
              <li><strong>3 months–5 years:</strong> fast breathing, low energy, worsening cough</li>
            </ul>

            <h3>What to Do</h3>
            <p>
              Trust your instincts. Seek emergency care for severe symptoms and consult a pediatrician for persistent or worsening conditions.
            </p>

            <p className="modal-footer">
              This information is for guidance only and does not replace professional medical advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizComponent;
