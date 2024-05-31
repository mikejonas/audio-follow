"use client";
import React, { useState, useEffect } from "react";
import sentences from "../utils/sentences";

interface SummaryProps {
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
}

const Summary: React.FC<SummaryProps> = ({ audioPlayerRef }) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  useEffect(() => {
    const handleTimeUpdate = () => {
      const currentTime = audioPlayerRef.current?.currentTime ?? 0;
      const sentence = sentences[currentSentenceIndex];

      // Check that there is a next sentence before incrementing the sentence index
      if (
        currentSentenceIndex < sentences.length - 1 &&
        currentTime >= sentence.endTime
      ) {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
      }
    };
    const handleSeeked = () => {
      const currentTime = audioPlayerRef.current?.currentTime ?? 0;
      const newSentenceIndex = sentences.findIndex(
        (sentence) =>
          sentence.startTime <= currentTime && currentTime < sentence.endTime
      );

      if (newSentenceIndex !== -1) {
        setCurrentSentenceIndex(newSentenceIndex);
      }
    };

    audioPlayerRef.current?.addEventListener("timeupdate", handleTimeUpdate);
    audioPlayerRef.current?.addEventListener("seeked", handleSeeked);

    return () => {
      audioPlayerRef.current?.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );
      audioPlayerRef.current?.removeEventListener("seeked", handleSeeked);
    };
  }, [currentSentenceIndex]);

  return (
    <div>
      {sentences.map((sentence: any, index: any) => (
        <span
          key={index}
          className={
            index === currentSentenceIndex ? "highlight active" : "highlight"
          }
          onClick={() => {
            audioPlayerRef.current!.currentTime = sentence.startTime;
            setCurrentSentenceIndex(index);
          }}
        >
          {sentence.value}
        </span>
      ))}
    </div>
  );
};

export default Summary;
