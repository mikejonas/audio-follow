"use client";
import { useRef } from "react";
import Summary from "./components/Summary";
import AudioPlayer from "./components/AudioPlayer";

export default function Home() {
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-3xl items-center justify-between font-mono text-sm lg:flex">
        <Summary audioPlayerRef={audioPlayerRef} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white pb-4 z-50">
        <AudioPlayer audioPlayerRef={audioPlayerRef} />
      </div>
    </main>
  );
}
