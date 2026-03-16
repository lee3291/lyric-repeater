# Lyric Repeater

A web app for practicing singing by looping individual lines of a song in sync with the music.

**Live Demo:** https://lyric-repeater.vercel.app/

---

## Features

- Real-time lyric highlighting synced to audio playback
- Click any lyric line to jump to that timestamp
- Pin a line to loop it repeatedly — ideal for singing practice
- Auto-scrolling lyrics that follow the current line
- Upload your own MP3 and LRC/JSON lyrics file
- Adjustable lyric sync offset to fine-tune timing
- Keyboard shortcuts: `Space` to play/pause, `P` to pin/unpin

---

## Tech Stack

- React (Vite)
- Tailwind CSS
- Lucide React (icons)

---

## Running Locally

```bash
git clone https://github.com/lee3291/lyric-repeater.git
cd lyric-repeater
npm install
npm run dev
```

---

## Using Your Own Songs

1. Download an MP3 of your song
2. Find the LRC file at [lyricsify.com](https://www.lyricsify.com/) or similar
3. Upload both files using the upload inputs at the top of the app
4. Adjust the offset slider if lyrics feel early or late

---

## What I Built This For

This project was built to solidify React core concepts including `useState`, `useEffect`, `useRef`, event handling, and the stale closure problem — all applied to a working product.
