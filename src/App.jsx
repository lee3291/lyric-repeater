import { useState, useRef, useEffect } from "react";
import { Play, Pause, Pin, PinOff } from "lucide-react";
import lyricsData from "./data/lyrics.json";

function App() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [playTime, setPlayTime] = useState(0);
  const [currLine, setCurrLine] = useState();
  const lyricRef = useRef(null);
  const [loopLine, setLoopLine] = useState(false);
  const loopLineRef = useRef(false);
  const loopLineDataRef = useRef(null);
  const loopLineObjectRef = useRef(null);
  const autoScrollRef = useRef(true);
  const scrollTimerRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (lyricRef.current && autoScrollRef.current) {
      lyricRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currLine]);

  function handleToggleAudio() {
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
    handleLineUpdate();

    if (loopLineRef.current) {
      const currTime = loopLineDataRef.current;
      let startTime = 0;
      let endTime = 0;

      for (let i = lyricsData.length - 1; i >= 0; i--) {
        if (lyricsData[i].time < currTime) {
          if (lyricsData[i] && lyricsData[i + 1]) {
            startTime = lyricsData[i].time + 1.1;
            endTime = lyricsData[i + 1].time + 1.1;
            if (audioRef.current.currentTime > endTime) {
              audioRef.current.currentTime = startTime;
            }
          }
          break;
        }
      }
    }
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
    const isCurrent = line.time === currLine?.time;
    const isPinned = loopLineObjectRef.current?.time === line.time;

    let className = "";
    if (isCurrent) {
      if (isPinned) {
        className = "text-white";
      } else {
        className = "text-white";
      }
    } else {
      className = "text-white opacity-40";
    }

    return (
      <p
        key={line.time}
        ref={isCurrent ? lyricRef : null}
        className={`${className} group flex items-center gap-2`}
        onClick={() => handleLyricJump(line.time + 1.1)}
      >
        <span
          className={`${isPinned ? "opacity-100 border-r-3 border-red-400" : "opacity-0 group-hover:opacity-100"} transition flex-shrink-0 pr-1`}
        >
          <button
            className="py-1 px-2 text-white rounded cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleLyricJump(line.time + 1.1);
              loopLineDataRef.current = audioRef.current.currentTime;
              loopLineObjectRef.current = loopLineRef.current
                ? null // unpinning, clear it
                : getLineByTime(audioRef.current.currentTime); // pinning, set it
              loopLineRef.current = !loopLineRef.current;
              setLoopLine(!loopLine);
            }}
          >
            {loopLine ? <PinOff /> : <Pin />}
          </button>
        </span>
        {line.text}
      </p>
    );
  });

  function handleLineUpdate() {
    const currTime = audioRef.current.currentTime;
    for (let i = lyricsData.length - 1; i >= 0; i--) {
      // slight delay cause it's too fast.
      if (lyricsData[i].time <= currTime - 1) {
        setCurrLine(lyricsData[i]);
        break;
      }
    }
  }

  function handleSeek(e) {
    const bar = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - bar.left;
    const percentage = clickX / bar.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  }

  function handleLyricJump(lineTime) {
    audioRef.current.currentTime = lineTime;
  }

  function handleAutoScrollToggle() {
    autoScrollRef.current = false;
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      autoScrollRef.current = true;
    }, 1500);
  }

  function getLineByTime(time) {
    for (let i = lyricsData.length - 1; i >= 0; i--) {
      if (lyricsData[i].time < time) {
        return lyricsData[i];
      }
    }
    return null;
  }

  return (
    <div className="bg-neutral-600 max-w-3xl mx-auto rounded-2xl">
      {/* audio tag */}
      <audio src="src/data/6-foot-7-foot.mp3" ref={audioRef}></audio>
      {/* lyrics tab */}
      <div
        className="h-120 overflow-y-auto flex flex-col gap-7 p-4 max-w-3xl mx-auto mt-9 rounded-2xl text-2xl bg-auto"
        onScroll={handleAutoScrollToggle}
      >
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
          {/* play/pause button */}
          <button
            className="py-1 px-2 text-white rounded hover:bg-gray-500 cursor-pointer"
            onClick={handleToggleAudio}
          >
            {playing ? <Pause /> : <Play />}
          </button>
          {/* loop line button(pinButton) */}
          <button
            className="py-1 px-2 text-white rounded hover:bg-gray-500 cursor-pointer"
            onClick={() => {
              loopLineDataRef.current = audioRef.current.currentTime;
              loopLineObjectRef.current = getLineByTime(
                audioRef.current.currentTime,
              );
              loopLineRef.current = !loopLineRef.current;
              setLoopLine(!loopLine);
            }}
          >
            {loopLine ? <PinOff /> : <Pin />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
