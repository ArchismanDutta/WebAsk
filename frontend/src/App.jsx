import { useState, useEffect } from "react";
import axios from "axios";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

function App() {
  const [question, setQuestion] = useState("");
  const [url, setUrl] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // toggle voice output

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && transcript.length > 0) {
      setQuestion(transcript);
    }
  }, [transcript]);

  const handleAsk = async () => {
    if (!question || !url) return alert("Please provide both question and URL.");
    setLoading(true);
    setAnswer("");
    try {
      const response = await axios.post("http://localhost:8000/ask", {
        question,
        url,
      });

      const result = response.data.answer || response.data.error;
      setAnswer(result);

      if (voiceEnabled) speakAnswer(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAnswer("Something went wrong.");
    }
    setLoading(false);
  };

  const handleStartListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  const speakAnswer = (text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser doesn't support speech recognition. Please use Chrome.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">🧠 WebQA Assistant</h1>

      <input
        type="text"
        placeholder="Enter your question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full max-w-md p-3 mb-4 rounded border border-gray-300"
      />
      <input
        type="text"
        placeholder="Enter website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full max-w-md p-3 mb-4 rounded border border-gray-300"
      />

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleStartListening}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          🎙 Start Voice
        </button>
        <button
          onClick={handleStopListening}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          🛑 Stop
        </button>
      </div>

      <label className="flex items-center mb-4 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={voiceEnabled}
          onChange={() => setVoiceEnabled(!voiceEnabled)}
          className="mr-2"
        />
        Speak answer aloud
      </label>

      <button
        onClick={handleAsk}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Processing..." : "Get Answer"}
      </button>

      {answer && (
        <div className="mt-6 w-full max-w-2xl bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Answer:</h2>
          <p className="mb-4">{answer}</p>
          <div className="flex gap-4">
            <button
              onClick={() => speakAnswer(answer)}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              🔊 Listen Again
            </button>
            <button
              onClick={stopSpeaking}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              🔇 Stop Speaking
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        🎧 Listening: {listening ? "Yes" : "No"}
      </div>
    </div>
  );
}

export default App;
