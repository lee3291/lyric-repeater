import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [playTime, setPlayTime] = useState("0:00"); // min and sec, string.

  function toggleAudio() {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
  }

  function handleTimeUpdate() {
    let time = audioRef.current.currentTime;
    let min = String(Math.floor(time / 60));
    let sec = String(Math.floor(time % 60)).padStart(2, "0");
    setPlayTime(`${min}:${sec}`);
  }

  return (
    <div>
      <audio src="src/data/t-rex-roar.mp3" ref={audioRef}></audio>
      <button onClick={toggleAudio}>{playing ? "Pause" : "Play"}</button>
      <p>{playTime}</p>
    </div>
  );
}

export default App;
