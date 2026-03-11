import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  function toggleAudio() {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  }

  return (
    <div>
      <audio src="src/data/t-rex-roar.mp3" ref={audioRef}></audio>
      <button onClick={toggleAudio}>{playing ? "Pause" : "Play"}</button>
    </div>
  );
}

export default App;
