import React, { useState } from "react";
import VoiceInput from "./VoiceInput";
import axios from "axios";

function AskForm() {
  const [question, setQuestion] = useState("");
  const [url, setUrl] = useState("");
  const [answer, setAnswer] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const handleSubmit = async () => {
    if (!question || !url) return alert("Please provide both question and URL.");
    try {
      const res = await axios.post("http://localhost:8000/ask", {
        question,
        url,
      });

      const result = res.data.answer || res.data.error;
      setAnswer(result);

      if (voiceEnabled) speakAnswer(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAnswer("An error occurred.");
    }
  };

  const speakAnswer = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "1rem" }}>
      <h2>Ask a Question from Any Website</h2>

      <input
        type="text"
        placeholder="Website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />

      <textarea
        placeholder="Type your question or use the mic below..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
      />

      {/* Voice Input Section */}
      <VoiceInput setQuestion={setQuestion} />

      {/* Voice Toggle */}
      <label style={{ display: "block", marginTop: "1rem", marginBottom: "1rem" }}>
        <input
          type="checkbox"
          checked={voiceEnabled}
          onChange={() => setVoiceEnabled(!voiceEnabled)}
        />
        &nbsp; Speak Answer Aloud
      </label>

      <button
        onClick={handleSubmit}
        style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}
      >
        Ask
      </button>

      {answer && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Answer:</h4>
          <p>{answer}</p>
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={() => speakAnswer(answer)} style={{ marginRight: "1rem" }}>
              🔊 Listen Again
            </button>
            <button onClick={stopSpeaking}>🛑 Stop Speaking</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AskForm;
