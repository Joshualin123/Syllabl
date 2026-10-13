"use client";
import {useState} from 'react';
import { Rubik_Spray_Paint } from "next/font/google";
import { useRouter } from "next/navigation";

const rubikSprayPaint = Rubik_Spray_Paint({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {

  const [showRules, setShowRules] = useState(false);
  const router = useRouter();

  return (
      <main className='home'>
        <div className='home-mid-container'>
          <h1 className={`home-title ${rubikSprayPaint.className}`}>
            Sy
            <span className="logo-dot">·</span>
            lla
            <span className="logo-dot">·</span>
            bl
            <span className="logo-dot">.</span>
            io
          </h1>
          <div className='home-mid-bottom-container'>
            <button className='home-start-button' onClick={() => router.push("/game")}>Play</button>
            <button className='home-rules-button' 
            onClick={() => setShowRules(true)}>How To Play</button>
          </div>
          
        </div>
        <div className={`home-info-pop-up ${showRules ? "front" : "behind"}`}>
          A random word will be generated. You have a limited amount of time to type a word 
          which begins with the final syllable of the previous word. No names of any sort are valid, 
          this includes things like countries, peoples names, or brands.

          <button className='home-info-pop-up-close' onClick={() => setShowRules(false)}>Close</button>
        </div>

      </main>
  );
}
