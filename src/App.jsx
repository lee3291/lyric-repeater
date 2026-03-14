import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import lyricsData from "./data/lyrics.json";

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

  function getAudioName() {
    const src = audioRef.current?.src;
    if (!src) return "";
    return src.split("/").pop().replace(".mp3", "").replaceAll("-", " ");
  }

  const lyrics = lyricsData.map((line) => {
    return <p key={line.time}>{line.text}</p>;
  });

  function handleSeek(e) {
    const bar = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - bar.left;
    const percentage = clickX / bar.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  }

  return (
    <div className="bg-neutral-600 max-w-3xl mx-auto rounded-2xl">
      {/* audio tag */}
      <audio src="src/data/6-foot-7-foot.mp3" ref={audioRef}></audio>
      {/* lyrics tab */}
      <div className="h-120 overflow-y-auto flex flex-col gap-7 p-4 max-w-2xl mx-auto mt-9 rounded-2xl text-2xl text-gray-300 bg-auto">
        {lyrics}
      </div>

      {/* progress bar + button + playtime + songname. */}
      <div className="flex flex-col gap-3 p-4 max-w-3xl mx-auto mt-5">
        {/* song name */}
        <div className="flex flex-col gap-2 mt-1 mb-4">
          <p className="text-white text-3xl text-center">{getAudioName()}</p>
          {/* artist name, hard code for now */}
          <p className="text-white text-1xl text-center">Lil Wayne</p>
        </div>

        {/* progress bar and timestamps */}
        <div className="flex flex-col gap-2">
          {/* progress bar */}
          <div>
            {/* progess bar background */}
            <div
              className="w-full h-1 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              {/* progress bar fill-in */}
              <div
                className="h-full bg-red-400 transition-all duration-300 ease-out relative"
                style={{
                  width: `${(playTime / (audioRef.current?.duration || 1)) * 100}%`,
                }}
              >
                {/* progress dot */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow hover:border cursor-pointer"></div>
              </div>
            </div>
          </div>
          {/* timestamps */}
          <div className="flex flex-row justify-between">
            <p className="text-white">{`${Math.floor(playTime / 60)}:${String(Math.floor(playTime % 60)).padStart(2, "0")}`}</p>
            <p className="text-white">{`${Math.floor((audioRef.current?.duration || 1) / 60)}:${String(Math.floor((audioRef.current?.duration || 1) % 60)).padStart(2, "0")}`}</p>
          </div>
        </div>
        <div className="flex flex-row justify-center w-full p-0">
          <button
            className="py-1 px-2 text-white rounded hover:bg-gray-500 cursor-pointer"
            onClick={toggleAudio}
          >
            {playing ? <Pause /> : <Play />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
