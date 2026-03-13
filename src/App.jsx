import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

function App() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [playTime, setPlayTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  function toggleAudio() {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
    setPlayTime(audioRef.current.currentTime);
    if (audioRef.current.ended) {
      setPlaying(false);
    }
  }

  function handleTimeUpdate() {
    setPlayTime(audioRef.current.currentTime);
  }

  function handleEnded() {
    setPlaying(false);
  }

  return (
    <div>
      {/* audio tag */}
      <audio src="src/data/6-foot-7-foot.mp3" ref={audioRef}></audio>
      {/* div tag for progress bar + button + playtime. */}
      <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto mt-20">
        {/* progess bar background */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          {/* progress bar fill-in */}
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{
              width: `${(playTime / (audioRef.current?.duration || 1)) * 100}%`,
            }}
          ></div>
        </div>
        {/* div tag for button + playtime */}
        <div className="flex items-center gap-4 bg-gray-600 p-6 rounded shadow">
          <button
            className="py-1 px-2 text-white bg-gray-600 rounded hover:bg-gray-500 cursor-pointer"
            onClick={toggleAudio}
          >
            {playing ? <Pause /> : <Play />}
          </button>
          <p className="text-white">{`${Math.floor(playTime / 60)}:${String(Math.floor(playTime % 60)).padStart(2, "0")}`}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
