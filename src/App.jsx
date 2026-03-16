import { useState, useRef, useEffect } from "react";
import { Play, Pause, Pin, PinOff } from "lucide-react";
import lyricsData from "./data/light-it-up.json";

function App() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [playTime, setPlayTime] = useState(0);
  const [currLine, setCurrLine] = useState();
  const currLinePtagRef = useRef(null);
  const [loopLine, setLoopLine] = useState(false);
  const isPinningRef = useRef(false);
  const pinnedLineTimeRef = useRef(null);
  const pinnedLineObjRef = useRef(null);
  const autoScrollRef = useRef(true);
  const scrollTimerRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState("src/data/Light-It-Up.mp3");
  const [audioName, setAudioName] = useState("");
  const [parsedLyrics, setParsedLyrics] = useState(lyricsData);
  const [songName, setSongName] = useState("Light It Up");
  const [artistName, setArtistName] = useState(
    "Robin Hustin x TobiMorrow (feat. Jex)",
  );
  const parsedLyricsRef = useRef(lyricsData);
  const [lyricsFileName, setLyricsFileName] = useState("");
  const [audioUploaded, setAudioUploaded] = useState(false);
  const [lyricsUploaded, setLyricsUploaded] = useState(false);
  const offsetRef = useRef(0);

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
    if (currLinePtagRef.current && autoScrollRef.current) {
      currLinePtagRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currLine]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.code === "Space") {
        e.preventDefault();
        handleToggleAudio();
      }
      if (e.code === "KeyP") {
        e.preventDefault();
        handleTogglePin();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

    if (isPinningRef.current) {
      const currTime = pinnedLineTimeRef.current;
      let startTime = 0;
      let endTime = 0;

      for (let i = parsedLyricsRef.current.length - 1; i >= 0; i--) {
        if (parsedLyricsRef.current[i].time <= currTime) {
          if (parsedLyricsRef.current[i + 1]) {
            startTime = parsedLyricsRef.current[i].time + offsetRef.current;
            endTime = parsedLyricsRef.current[i + 1].time + offsetRef.current;
          } else {
            startTime = parsedLyricsRef.current[i].time + offsetRef.current;
            endTime = audioRef.current.duration;
          }
          if (audioRef.current.currentTime > endTime) {
            audioRef.current.currentTime = startTime;
          }
          break;
        }
      }
    }
  }

  function handleEnded() {
    setPlaying(false);
    if (isPinningRef.current) {
      audioRef.current.currentTime = pinnedLineTimeRef.current;
      audioRef.current.play();
      setPlaying(true);
    }
  }

  const lyricElements = parsedLyrics
    ? parsedLyrics.map((line) => {
        const isCurrent = line.time === currLine?.time;
        const isPinned = pinnedLineObjRef.current?.time === line.time;

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
            ref={isCurrent ? currLinePtagRef : null}
            className={`${className} group flex items-center gap-2`}
            onClick={() => handleLyricJump(line.time + offsetRef.current)}
          >
            <span
              className={`${isPinned ? "opacity-100 border-r-3 border-red-400" : "opacity-0 group-hover:opacity-100"} transition flex-shrink-0 pr-1`}
            >
              <button
                className="py-1 px-2 text-white rounded cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLyricJump(line.time + offsetRef.current);
                  handleTogglePin(line.time, line);
                }}
              >
                {loopLine ? <PinOff /> : <Pin />}
              </button>
            </span>
            {line.text}
          </p>
        );
      })
    : [];

  function handleLineUpdate() {
    const currTime = audioRef.current.currentTime;
    for (let i = parsedLyricsRef.current.length - 1; i >= 0; i--) {
      // slight delay cause it's too fast.
      if (parsedLyricsRef.current[i].time <= currTime - offsetRef.current) {
        setCurrLine(parsedLyricsRef.current[i]);
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
    for (let i = parsedLyricsRef.current.length - 1; i >= 0; i--) {
      if (parsedLyricsRef.current[i].time < time) {
        return parsedLyricsRef.current[i];
      }
    }
    return null;
  }

  function handleFileInput(e) {
    if (audioUploaded) {
      window.location.reload();
      return;
    }
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setAudioSrc(url);
    setAudioName(file.name.replace(/\.[^/.]+$/, ""));
    setAudioUploaded(true);
  }

  function handleLyricsUpload(e) {
    if (lyricsUploaded) {
      window.location.reload();
      return;
    }
    const file = e.target.files[0];
    setLyricsFileName(file.name);
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const text = readerEvent.target.result;
      if (file.name.endsWith(".json")) {
        const lyricsArray = JSON.parse(text);
        setParsedLyrics(lyricsArray);
        parsedLyricsRef.current = lyricsArray;
      } else {
        const linesArray = text.split(/\r?\n|\r|\n/g);
        const parsed = [];
        for (const line of linesArray) {
          if (line.startsWith("[ti")) {
            setSongName(line.slice(4, line.length - 1));
          } else if (line.startsWith("[ar")) {
            setArtistName(line.slice(4, line.length - 1));
          } else if (/^\[\D/.test(line)) {
            continue;
          } else {
            const index = line.indexOf("]");
            if (index !== -1) {
              const before = line.slice(1, index);
              const [mm, rest] = before.split(":");
              const [ss, xx] = rest.split(".");
              const totalSec = Number(mm) * 60 + Number(ss) + Number(xx) / 100;
              const after = line.slice(index + 1);
              parsed.push({ time: totalSec, text: after });
            }
          }
        }
        setLyricsUploaded(true);
        setParsedLyrics(parsed);
        parsedLyricsRef.current = parsed;
      }
    };
    reader.readAsText(file);
  }

  function handleTogglePin(lineTime, lineObj) {
    const currentLine =
      lineObj ??
      getLineByTime(audioRef.current.currentTime - offsetRef.current);
    const time = lineTime ?? audioRef.current.currentTime - offsetRef.current;
    console.log(
      "pinning at time:",
      time,
      "currentTime:",
      audioRef.current.currentTime,
      "offset:",
      offsetRef.current,
    );
    pinnedLineTimeRef.current = time;
    pinnedLineObjRef.current = isPinningRef.current ? null : currentLine;
    isPinningRef.current = !isPinningRef.current;
    setLoopLine(isPinningRef.current);
  }

  return (
    <div>
      {/* file upload box */}
      <div className="flex flex-row bg-neutral-600 max-w-3xl h-20 mx-auto rounded-2xl mt-5">
        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:border-gray-300 transition">
          <p className="text-gray-400 text-sm">
            {audioName || "Drop audio file here"}
          </p>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:border-gray-300 transition">
          <p className="text-gray-400 text-center">
            {lyricsFileName || "Drop LRC or JSON files here for your lyrics"}
          </p>
          <input
            type="file"
            accept=".lrc,.json"
            className="hidden"
            onChange={handleLyricsUpload}
          />
        </label>
      </div>
      <div className="bg-neutral-600 max-w-3xl mx-auto rounded-2xl">
        {/* audio tag */}
        <audio src={audioSrc} ref={audioRef}></audio>
        {/* lyrics tab */}
        <div
          className="h-110 overflow-y-auto flex flex-col gap-7 p-4 max-w-3xl mx-auto mt-9 rounded-2xl text-2xl bg-auto"
          onScroll={handleAutoScrollToggle}
        >
          {lyricElements}
        </div>

        {/* progress bar + button + playtime + songname. */}
        <div className="flex flex-col gap-3 p-4 max-w-3xl mx-auto mt-5">
          {/* song name */}
          <div className="flex flex-col gap-2 mt-1 mb-4">
            <p className="text-white text-3xl text-center">{songName}</p>
            <p className="text-white text-2xl text-center">{artistName}</p>
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
          <div className="relative flex flex-row justify-center w-full p-0">
            {/* offset */}
            <div className="absolute left-0 flex items-center gap-2">
              <p className="text-white text-sm">Offset</p>
              <input
                type="number"
                step="0.1"
                defaultValue="0"
                className="w-20 bg-neutral-500 text-white text-sm rounded px-2 py-1 text-center"
                onChange={(e) => {
                  offsetRef.current = Number(e.target.value);
                }}
              />
            </div>
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
                handleTogglePin();
              }}
            >
              {loopLine ? <PinOff /> : <Pin />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
