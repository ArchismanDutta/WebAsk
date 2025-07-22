import React from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

const VoiceInput = ({ setQuestion }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <p>Your browser doesn't support voice input.</p>;
  }

  const handleUseVoice = () => {
    setQuestion(transcript);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <p>🎤 Voice Input: {listening ? "Listening..." : "Idle"}</p>
      <button onClick={SpeechRecognition.startListening}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <button onClick={handleUseVoice}>Use Transcript</button>
    </div>
  );
};

export default VoiceInput;
