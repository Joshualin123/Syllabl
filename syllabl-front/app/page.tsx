"use client";
import Image from "next/image";
import {useState} from 'react';

export default function Home() {

  const [showRules, setShowRules] = useState(false);

  return (
      <main className='home'>
        <div className='home-mid-container'>
          <h1 className='home-title'>Syllabl</h1>
          <div className='home-mid-bottom-container'>
            <button className='home-start-button'>Start</button>
            <button className='home-rules-button' 
            onClick={() => setShowRules(true)}>How To Play</button>
          </div>
          
        </div>
        <div className={`home-info-pop-up ${showRules ? "front" : "behind"}`}>
          A random word will be generated. You have a limited amount of time to type a word 
          which begins with the final syllable of the previous word. 

          <button className='home-info-pop-up-close' onClick={() => setShowRules(false)}>Close</button>
        </div>

      </main>
  );
}
