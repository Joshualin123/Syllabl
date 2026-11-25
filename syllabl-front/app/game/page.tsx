"use client"
import styles from "./game.module.css";
import {useState, useEffect} from 'react';


const backEndUrl = 'https://syllabl.onrender.com/';

export default function Game() {

    //default game setting vars
    const gameTimeConst = 60;
    const wordTimeConst = 5;
    const countdownConst = 3;
    const [showSettings, setSettings] = useState(true); //state to toggle settings
    const [highlightLast, toggleHighlight] = useState(false);
    const [showReset, toggleShowReset] = useState(true);

    const [wordScoreMultiplier, setWordMultiplier] = useState(1);
    const [gameScoreMultiplier, setGameMultiplier] = useState(1);
    const [highlightMultiplier, setHighlightMultiplier] = useState(1);
    const [resetMultiplier, setResetMultiplier] = useState(1);

    const [totalMultiplier, setTotalMultiplier] = useState(1);

    const [countdown, setCountdown] = useState(countdownConst); //countdown before starting game
    const [showCountdown, setShowCountdown] = useState(true); //toggle countdown popup

    const [lastSyllable, setLastSyllable] = useState('')

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
        const response = await fetch(backEndUrl + "polls/get-word")

        const data = await response.json();

        setLastSyllable(data.syllables.at(-1));
        setWord(data.word);
    }

    async function checkWord() {

        console.log("ran checkWord");

        const response = await fetch(backEndUrl + "polls/check-word", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({initial_word: word, input_word: inputWord})
        })

        const data = await response.json();

        setInputWord(""); //clear input box

        if (data.message == "Valid") {
            setInputWord(""); //clear input box
            getWord(); //get new word

            setTime(totalTime); //reset timer
            setWordEndTime(Date.now() + totalTime * 1000)
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

    //On mount, get initial word, start countdown
    useEffect(() => {
        getWord();
    }, []);

    useEffect(() => {
        setTotalMultiplier(Math.round(Math.max(wordScoreMultiplier * gameScoreMultiplier * highlightMultiplier * resetMultiplier) * 100) / 100)
    }, [wordScoreMultiplier, gameScoreMultiplier, highlightMultiplier, resetMultiplier])

    useEffect(() => {

        const endTime = Date.now() + 3_000;

        if (!showCountdown) {
            return;
        }

        if (showSettings) {
            return;
        }

        const timer = setInterval(() => {   

            const remaining = Math.round(Math.max(0, Math.ceil(endTime - Date.now()) / 1000) * 10) / 10;

            setCountdown(remaining);

            if (remaining <= 0) {
                setShowCountdown(false);
                setGameEndTime(Date.now() + totalGameTime * 1000);
                setWordEndTime(Date.now() + totalTime * 1000);
            }

        }, 10);

        return () => clearInterval(timer);
    }, [showCountdown, showSettings]);

    //word timer
    useEffect(() => {

        if (gameEndBool || showCountdown || showSettings) {
            return;
        }

        if (wordEndTime === null) { //set the end timestamp
            setWordEndTime(Date.now() + totalTime * 1000)
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
                setErrBool(false); //clear err msg
                setWordEndTime(Date.now() + totalTime * 1000);
            }
            
        }, 10);

        return () => clearInterval(timer);
        
        
    }, [gameEndBool, showCountdown, wordEndTime, time]); //vars that trigger this useEffect

    //game duration timer
    useEffect(() => {

        if (gameEndBool || showCountdown || showSettings) {
            return;
        }

        if (gameEndTime === null) {
            setGameEndTime(Date.now() + totalGameTime * 1000)
            return;
        }

        const timer = setInterval(() => {

            // Update remaining time to 1 decimal place
            const remaining = Math.round(Math.max(0, Math.ceil(gameEndTime - Date.now()) / 1000) * 100) / 100;

            setTotalGameTime(remaining);

            if (remaining <= 0) {
                setGameEndBool(true);
                setTotalGameTime(gameTimeConst);
                setGameEndTime(Date.now() + gameTimeConst * 1000);
            }
            
        }, 10);

        return () => clearInterval(timer);
        
    }, [gameEndBool, showCountdown, gameEndTime, showSettings]);

    function startGame() {
        setSettings(false);
        setShowCountdown(true);
        setTotalGameTime(totalGameTime);
    }

    function resetGame() { //reset game timer, bool
        setGameEndBool(false);
        setTotalGameTime(totalGameTime);
        setCountdown(3);
        setShowCountdown(true);
        setTime(totalTime);
        setScore(0);
        setInputWord("");
        setErrMsg("");
        setErrBool(false);
        setGameEndTime(Date.now() + (totalGameTime + countdownConst) * 1000)
        setSettings(true);
    }

    return (
        <main className={styles.game}> {/* could create a var for background-color, since this and gameErrMsg must share bg color */}
            
            <div className={styles.gameSettings} style={{zIndex: showSettings ? 11 : -1, visibility: showSettings ? "visible" : "hidden"}}>
                <div className={styles.gameSettingChild}>
                    Time per word: <span>{totalTime}</span>
                    <input
                        type="range"
                        min={1}
                        max={10}
                        value={totalTime}
                        onChange={(e) => {
                            setTotalTime(Number(e.target.value));
                            setTime(Number(e.target.value));
                            setWordMultiplier(Math.round(Math.max(0, wordTimeConst/Number(e.target.value)) * 100) /100);
                        }}
                    />
                    Score Multiplier: {wordScoreMultiplier}
                </div>
                <div className={styles.gameSettingChild}>
                    Game Duration: <span>{totalGameTime}</span>
                    <input
                        type="range"
                        min={1}
                        max={180}
                        value={totalGameTime}
                        onChange={(e) => {
                            setTotalGameTime(Number(e.target.value))
                            setGameMultiplier(Math.round(Math.max(0, gameTimeConst/Number(e.target.value)) * 100) /100)
                            }
                        }
                    />
                    Score Multiplier: {gameScoreMultiplier}
                </div>
                <div className={styles.gameSettingChild}>
                    Highlight Last Syllable
                    <input 
                    type="checkbox" 
                    checked={highlightLast}
                    onChange={(e) => {
                        toggleHighlight(e.target.checked)

                        if (e.target.checked) {
                            setHighlightMultiplier(0.5);
                        }
                        else {
                            setHighlightMultiplier(1);
                        }
                    }}
                    />
                    Score Multiplier: {highlightMultiplier}
                </div>
                <div className={styles.gameSettingChild}>
                    Remove Reset Button
                    <input 
                        type="checkbox" 
                        checked={!showReset}
                        onChange={(e) => 
                            {
                                toggleShowReset(!e.target.checked)
                            
                                if (e.target.checked) {
                                    setResetMultiplier(1.1);
                                }
                                else {
                                    setResetMultiplier(1);
                                }
                            }
                        }
                    />
                    Score Multiplier: {resetMultiplier}
                </div>

                <div className={styles.gameCloseSettings}>
                    Total Score Multiplier: {totalMultiplier}
                    <button className={styles.gameResetButton} onClick={startGame}>Start</button>
                </div>
            </div>

            <div className={styles.gameCountdown} style={{zIndex: showCountdown ? 10: -1, visibility: showCountdown ? "visible" : "hidden"}}>{countdown}</div>

            <div className={styles.gameEndPopUp} style={{zIndex: gameEndBool ? 10 : -1, visibility: gameEndBool ? "visible" : "hidden"}}>
                <p className={styles.gameScore}>Score: {score}</p>
                <button className={styles.gameResetButton} onClick={resetGame}>Play Again</button>
            </div>

            <p className={styles.gameTimer}>{totalGameTime.toFixed(1)}</p>

            <div className={styles.gameMidContainer}>

                <p className={styles.gameErrMsg} style={{color: errBool ? "#FFFFFF" : "#242a4366"}}>{errMsg}</p>

                <div className={styles.gameOldWordContainer}>
                    {highlightLast ? (
                        <>
                            {word.slice(0, word.length - lastSyllable.length)}
                            <span className={styles.highlightedSyllable}>
                                {lastSyllable}
                            </span>
                        </>
                    ) : (
                        word
                    )}
                </div>

                <div className={styles.gameBarTrack}>
                    <div className={styles.gameBar} style={{width: `${(time / totalTime) * 100}%`}}></div>
                </div>

                <input 
                    autoFocus
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
                
                <button className={styles.gameWordResetButton} style={{zIndex: showReset ? 10: -1, visibility: showReset ? "visible" : "hidden"}} onClick={() => {getWord()}}>Reset Word</button>
            </div>
        </main>
    );
}