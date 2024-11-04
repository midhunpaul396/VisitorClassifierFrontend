import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [url, setUrl] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState(""); // New state for model type

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setQuestions([]);
    setCategory("");
    setModel(""); // Reset model state on new submit

    const buttonClicked = e.nativeEvent.submitter.name;

    try {
      let response;
      if (buttonClicked === "ollamaSubmit") {
        setModel("ollama"); // Set model to ollama
        response = await axios.post(
          "http://localhost:5000/generate-questions",
          { url }
        );
      } else if (buttonClicked === "openaiSubmit") {
        setModel("openai"); // Set model to openai
        response = await axios.post(
          "http://localhost:5000/generate-openai-questions",
          { url }
        );
      }

      const questionsData = response.data.questions;
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error fetching questions:", error);
      alert(
        error.response
          ? `Error: ${error.response.status} - ${error.response.data.error}`
          : "Network error: Could not reach the server."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionIndex, answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: answer,
    }));
  };

  const handleCategorizeSubmit = async () => {
    const userResponse = Object.values(answers).join(", ");
    
    // Choose the endpoint based on the stored model type
    const categorizeUrl = model === "ollama" 
      ? "http://localhost:5000/categorize-ollama" 
      : "http://localhost:5000/categorize-openai";
  
    try {
      const response = await axios.post(categorizeUrl, {
        user_response: userResponse,
      });
      setCategory(response.data.category);
    } catch (error) {
      console.error("Error categorizing user:", error);
      alert("Failed to categorize. Please try again.");
    }
  };

  // Scroll to the bottom when `category` state is updated
  useEffect(() => {
    if (category) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  }, [category]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Visitor Web Scraper
        </h1>
        <form onSubmit={handleUrlSubmit} className="mb-6">
          <label className="block text-gray-600 mb-2">
            Enter URL You Wish to Submit:
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
          <div className="flex space-x-4">
            <button
              type="submit"
              name="openaiSubmit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              OpenAI Submit
            </button>
            <button
              type="submit"
              name="ollamaSubmit"
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
            >
              Ollama Submit
            </button>
          </div>
        </form>

        {loading && <p className="text-gray-500">Loading questions...</p>}

        {questions.length > 0 && (
          <div className="text-left">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Questions
            </h2>
            {questions.map((question, index) => (
              <div key={index} className="mb-4">
                <p className="text-gray-700">{question.question}</p>
                {question.options.map((option, i) => (
                  <label key={i} className="block text-gray-600 ml-4">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      onChange={() => handleOptionChange(index, option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            ))}
            <button
              onClick={handleCategorizeSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
            >
              Submit Answers
            </button>
          </div>
        )}

        {category && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Category
            </h2>
            <p className="text-green-500">{category}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
