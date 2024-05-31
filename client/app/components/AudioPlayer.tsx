"use client";
import React, { useState, useRef, useEffect } from "react";
import sentences from "../utils/sentences";

interface AudioPlayerProps {
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioPlayerRef }) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    let volumeValue = e.target.valueAsNumber;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = volumeValue;
    }
    setVolume(volumeValue);
  };

  // Add this helper function to format seconds into MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  useEffect(() => {
    const handleLoadedData = () => {
      console.log(audioPlayerRef.current?.duration);
      setDuration(audioPlayerRef.current?.duration ?? 0);
      if (isPlaying) {
        audioPlayerRef.current?.play();
      }
    };

    const handleTimeUpdate = () => {
      const currentTime = audioPlayerRef.current?.currentTime ?? 0;
      setCurrentTime(currentTime);
      const sentence = sentences[currentSentenceIndex];
      if (currentTime >= sentence.endTime) {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
      }
    };

    const handleError = () => {
      console.error("Error loading audio");
    };

    if (audioPlayerRef.current) {
      // If the readyState is greater than 0, the media is already loaded or is in the process of loading
      if (audioPlayerRef.current.readyState > 0) {
        handleLoadedData();
      } else {
        audioPlayerRef.current.addEventListener("loadeddata", handleLoadedData);
      }

      audioPlayerRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioPlayerRef.current.addEventListener("error", handleError);
    }

    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.removeEventListener(
          "loadeddata",
          handleLoadedData
        );
        audioPlayerRef.current.removeEventListener(
          "timeupdate",
          handleTimeUpdate
        );
        audioPlayerRef.current.removeEventListener("error", handleError);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioPlayerRef.current?.play();
    } else {
      audioPlayerRef.current?.pause();
    }
  }, [isPlaying, currentSentenceIndex, isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(false);
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const width = rect.width;
      const currentTime = (x / width) * duration; // calculate current time based on position clicked in element
      setCurrentTime(currentTime);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.currentTime = currentTime;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isDragging && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const currentTime = (x / width) * duration;
      setCurrentTime(currentTime);
    }
  };

  const progressBarWidth = (currentTime / duration) * 100;
  return (
    <>
      <audio ref={audioPlayerRef}>
        <source src="output.mp3" type="audio/mp3" />
      </audio>
      <div className="audio-player">
        <div
          className="timeline"
          ref={progressBarRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div
            className="progress"
            style={{ width: progressBarWidth + "%" }}
          ></div>
        </div>
        <div className="controls">
          <div className="play-container" onClick={togglePlay}>
            <div
              className={`toggle-play ${isPlaying ? "pause" : "play"}`}
            ></div>
          </div>
          <div className="time">
            <div className="current">{formatTime(currentTime)}</div>
            <div className="divider">/</div>
            <div className="length">{formatTime(duration)}</div>
          </div>
          <div className="name">Book Title: Chapter 1</div>
          <div className="volume-container">
            <div className="volume-button">
              <div className="volume icono-volumeMedium"></div>
            </div>
            <div className="volume-slider">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={changeVolume}
              />
              <div className="volume-percentage">{volume * 100 + "%"}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;
