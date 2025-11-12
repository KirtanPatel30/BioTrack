
/*
The quiz automatically generates each question using the animal dataset.
First, it randomly selects one animal and uses its conservation status to build question.
Then it selects two other animals as wrong choices, shuffles all three options, and shows them to the user.
We also explain the meaning of that conservation status to make the quiz more informative.
If the user picks the correct answer, they get a point and a new question appears.
If they pick wrong, they get one retry before the correct answer is revealed
*/

import React, { useState, useEffect } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function Quiz() {
  // Full animal dataset
  const [animals, setAnimals] = useState([]);

  // Holds current question text + correct answer
  const [question, setQuestion] = useState(null);

  // Multiple-choice options (3 animals)
  const [options, setOptions] = useState([]);

  // User score
  const [score, setScore] = useState(0);

  // Shows feedback like Correct / Wrong
  const [feedback, setFeedback] = useState("");

  // Tracks attempts allowed (2 tries)
  const [tries, setTries] = useState(0);

  //  Load animals from backend
  useEffect(() => {
    fetch(`${API_BASE}/animals`)
      .then((res) => res.json())
      .then((data) => setAnimals(data));
  }, []);

  //  Generates new question each round
  const generateQuestion = () => {
    if (animals.length < 3) return;

    setTries(0);
    setFeedback("");

    // Pick correct animal randomly
    const correct = animals[Math.floor(Math.random() * animals.length)];

    const correctName = correct.Animal;
    const status = correct["Conservation Status"];

    // Pick 2 wrong answers
    const wrong = animals
      .filter((a) => a.Animal !== correctName)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    // Shuffle all options
    const allOptions = [...wrong, correct].sort(() => Math.random() - 0.5);

    //  Explanations for each conservation status
    const statusExplanations = {
      "Least Concern":
        "species are widespread and abundant — they face no major threats.",
      "Near Threatened":
        "species may soon become vulnerable if threats continue.",
      Vulnerable:
        "species face a high risk of extinction in the wild.",
      Endangered:
        "species are at a very high risk of extinction — serious danger.",
      "Critically Endangered":
        "species face an extremely high risk of extinction — almost gone.",
      Extinct:
        "species no longer exist anywhere in the world.",
      Unknown:
        "the conservation status is not recorded or evaluated.",
    };

    //  Dynamic question text with explanation
    const questionText = `Which animal is categorized as "${status}" — meaning ${statusExplanations[status] || "status not defined."}`;

    // Save question
    setQuestion({ text: questionText, answer: correctName });

    // Save answer options
    setOptions(allOptions.map((a) => a.Animal));
  };

  //  Handle when user selects an answer
  const handleAnswer = (choice) => {
    if (!question) return;

    if (choice === question.answer) {
      setScore((s) => s + 1);
      setFeedback("✅ Correct!");
      setTimeout(generateQuestion, 1500);
    } else {
      if (tries < 1) {
        setTries(tries + 1);
        setFeedback("❌ Wrong! Try again.");
      } else {
        setFeedback(`❌ Wrong! The correct answer was: ${question.answer}`);
        setTimeout(generateQuestion, 1500);
      }
    }
  };

  //  Generate first question when data loads
  useEffect(() => {
    if (animals.length > 0) generateQuestion();
  }, [animals]);


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #90caf9 0%, #e3f2fd 100%)",
        fontFamily: "Segoe UI, Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "700px",
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
          transition: "transform 0.2s ease",
        }}
      >
        <h2 style={{ color: "#2e7d32", marginBottom: "1rem" }}>Quiz Mode</h2>
        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>
          <strong>Score:</strong> {score}
        </p>

        {question && (
          <>
            <p
              style={{
                lineHeight: "1.5",
                fontSize: "1.05rem",
                marginBottom: "1.5rem",
                color: "#333",
              }}
            >
              {question.text}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              {options.map((name) => (
                <button
                  key={name}
                  onClick={() => handleAnswer(name)}
                  style={{
                    padding: "0.8rem 1.6rem",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#1976d2",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "1rem",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => (e.target.style.background = "#0d47a1")}
                  onMouseOut={(e) => (e.target.style.background = "#1976d2")}
                >
                  {name}
                </button>
              ))}
            </div>

            <p
              style={{
                fontWeight: "bold",
                fontSize: "1.1rem",
                color: feedback.includes("Correct") ? "#2e7d32" : "#d32f2f",
                minHeight: "1.5rem",
              }}
            >
              {feedback}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
