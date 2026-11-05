"use client"
import styles from "./game.module.css";
import {useState, useEffect} from 'react';

export default function Game() {

    //game setting vars
    const gameTimeConst = 60;
    const wordTimeConst = 5;
    const countdownConst = 3;

    const [countdown, setCountdown] = useState(countdownConst); //countdown before starting game
    const [showCountdown, setShowCountdown] = useState(true); //toggle countdown popup

    //timer units are in seconds
    const [time, setTime] = useState(wordTimeConst); //remaining time for curr word
    const [wordEndTime, setWordEndTime] = useState<number | null>(null); //offset from when word is displayed
    const [totalTime, setTotalTime] = useState(wordTimeConst); //total time given per word
    const [totalGameTime, setTotalGameTime] = useState(gameTimeConst); //total game duration
    const [gameEndTime, setGameEndTime] =  useState<number | null>(null); //live offset from game start

    const [word, setWord] = useState(""); // starting/initial word
    const [inputWord, setInputWord] = useState(""); //users input
    const [score, setScore] = useState(0); //score per word will be based on length of final syllable, and if the final syllable is an entire word itself

    const [errMsg, setErrMsg] = useState(""); 
    const [errBool, setErrBool] = useState(false);

    const [gameEndBool, setGameEndBool] = useState(false);

    async function getWord() {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "polls/get-word")

        const data = await response.json();

        setWord(data.word);
    }

    //On mount, get initial word, start countdown
    useEffect(() => {
        getWord();
    }, []);

    useEffect(() => {

        const endTime = Date.now() + 3_000;

        if (!showCountdown) {
            return;
        }

        const timer = setInterval(() => {   

            const remaining = Math.round(Math.max(0, Math.ceil(endTime - Date.now()) / 1000) * 10) / 10;

            setCountdown(remaining);

            if (remaining <= 0) {
                setShowCountdown(false);
            }

        }, 10);

        return () => clearInterval(timer);
    }, [showCountdown]);

    async function checkWord() {

        console.log("ran checkWord");

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "polls/check-word", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({initial_word: word, input_word: inputWord})
        })

        const data = await response.json();
        
        if (data.message == "Valid") {
            setInputWord(""); //clear input box
            getWord(); //get new word

            setTime(totalTime); //reset timer
            setWordEndTime(Date.now() + wordTimeConst * 1000)
            console.log("valid word, reset time");

            setErrBool(false); //remove err msg
            setScore((prev) => prev + data.points);
            console.log(data.points);
        } else {
            setErrMsg(data.message);
            setErrBool(true);
            console.log(errMsg)
        }

    }

    //word timer
    useEffect(() => {

        if (gameEndBool || showCountdown) {
            return;
        }

        if (wordEndTime === null) { //set the end timestamp
            setWordEndTime(Date.now() + wordTimeConst * 1000)
            console.log("set word end time")
            return;
        }

        const timer = setInterval(() => {

            // Calculate difference between curr time stamp and end timestamp from before, convert to seconds, 2 decimal place
            const remaining = Math.round(Math.max(0, Math.ceil(wordEndTime - Date.now()) / 1000) * 100) / 100;

            setTime(remaining);

            //reset end timestamp when timestamp reached
            if (remaining <= 0) {
                getWord();
                setWordEndTime(Date.now() + wordTimeConst * 1000);
                console.log("remaining < 0, resetting word timer")
            }
            
        }, 10);

        return () => clearInterval(timer);
        
        
    }, [gameEndBool, showCountdown, wordEndTime, time]); //vars that trigger this useEffect

    //game duration timer
    useEffect(() => {

        if (gameEndBool || showCountdown) {
            return;
        }

        if (gameEndTime === null) {
            setGameEndTime(Date.now() + gameTimeConst * 1000)
            return;
        }

        const timer = setInterval(() => {

            // Update remaining time to 1 decimal place
            const remaining = Math.round(Math.max(0, Math.ceil(gameEndTime - Date.now()) / 1000) * 100) / 100;

            setTotalGameTime(remaining);

            if (remaining <= 0) {
                setGameEndBool(true);
                setGameEndTime(Date.now() + gameTimeConst * 1000);
            }
            
        }, 10);

        return () => clearInterval(timer);
        
    }, [gameEndBool, showCountdown, gameEndTime]);

    function resetGame() { //reset game timer, bool
        setGameEndBool(false);
        setTotalGameTime(gameTimeConst);
        setCountdown(3);
        setShowCountdown(true);
        setTime(wordTimeConst);
        setScore(0);
        setInputWord("");
        setErrMsg("");
        setErrBool(false);
        setGameEndTime(Date.now() + (gameTimeConst + countdownConst) * 1000)
    }

    return (
        <main className={styles.game}> {/* could create a var for background-color, since this and gameErrMsg must share bg color */}
            
            <div className={styles.gameCountdown} style={{zIndex: showCountdown ? 10: -1, visibility: showCountdown ? "visible" : "hidden"}}>{countdown}</div>

            <div className={styles.gameEndPopUp} style={{zIndex: gameEndBool ? 10 : -1, visibility: gameEndBool ? "visible" : "hidden"}}>
                <p className={styles.gameScore}>Score: {score}</p>
                <button className={styles.gameResetButton} onClick={resetGame}>Play Again</button>
            </div>

            <p className={styles.gameTimer}>{totalGameTime.toFixed(1)}</p>

            <div className={styles.gameMidContainer}>

                <p className={styles.gameErrMsg} style={{color: errBool ? "#FFFFFF" : "#242a4366"}}>{errMsg}</p>

                <div className={styles.gameOldWordContainer}>{word}</div>

                <div className={styles.gameBarTrack}>
                    <div className={styles.gameBar} style={{width: `${(time / totalTime) * 100}%`}}></div>
                </div>

                <input 
                    className={styles.gameNewWordContainer} 
                    placeholder="Enter word here..." 
                    value={inputWord} 
                    onChange={(e) => setInputWord(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            checkWord();
                        } 
                    }}
                >
                </input>
                
                <button className={styles.gameWordResetButton} onClick={() => {getWord()}}>Reset Word</button>
            </div>
        </main>
    );
}